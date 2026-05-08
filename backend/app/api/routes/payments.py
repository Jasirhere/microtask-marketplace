from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.api.deps import get_current_user
from app.services.job_store import get_job_by_id
from app.services.application_store import get_applications_for_job
from app.services.notification_store import create_notification

router = APIRouter(prefix="/payments", tags=["payments"])

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: int
    currency: str


class MarkPaidRequest(BaseModel):
    payment_intent_id: str


@router.post("/create-intent/{job_id}", response_model=CreatePaymentIntentResponse)
def create_payment_intent(job_id: str, current_user=Depends(get_current_user)):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured")

    job = get_job_by_id(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the poster can release payment")

    if job.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Payment is only available after job completion")

    if getattr(job, "payment_status", "UNPAID") == "PAID":
        raise HTTPException(status_code=400, detail="This job has already been paid")

    applications = get_applications_for_job(job.id)

    selected_app = next(
        (a for a in applications if a.status == "SELECTED"),
        None
    )

    if not selected_app:
        raise HTTPException(status_code=400, detail="No selected application found")

    amount_value = job.final_price or selected_app.proposed_rate

    if not amount_value or amount_value <= 0:
        raise HTTPException(status_code=400, detail="Invalid job amount")

    amount_in_cents = int(round(float(amount_value) * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency="usd",
            automatic_payment_methods={"enabled": True},
            metadata={
                "job_id": job.id,
                "poster_user_id": job.poster_user_id,
                "worker_user_id": job.selected_worker_user_id or "",
            },
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    job.stripe_payment_intent_id = intent.id

    return CreatePaymentIntentResponse(
        client_secret=intent.client_secret,
        payment_intent_id=intent.id,
        amount=amount_in_cents,
        currency="usd",
    )


@router.post("/mark-paid/{job_id}")
def mark_job_paid(
    job_id: str,
    payload: MarkPaidRequest,
    current_user=Depends(get_current_user),
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured")

    job = get_job_by_id(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the poster can mark payment as paid")

    if job.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Only completed jobs can be paid")

    if getattr(job, "payment_status", "UNPAID") == "PAID":
        return {
            "message": "Job already paid",
            "payment_status": job.payment_status,
            "paid_at": job.paid_at,
        }

    try:
        intent = stripe.PaymentIntent.retrieve(payload.payment_intent_id)
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if intent.status != "succeeded":
        raise HTTPException(status_code=400, detail="Stripe payment has not succeeded yet")

    intent_job_id = intent.metadata["job_id"]

    if intent_job_id != job.id:
        raise HTTPException(status_code=400, detail="PaymentIntent does not belong to this job")

    job.payment_status = "PAID"
    job.paid_at = datetime.now(timezone.utc)
    job.stripe_payment_intent_id = intent.id

    applications = get_applications_for_job(job.id)

    selected_app = next(
        (a for a in applications if a.status == "SELECTED"),
        None
    )

    amount_value = job.final_price or (selected_app.proposed_rate if selected_app else 0)

    try:
        # notify worker
        if job.selected_worker_user_id:
            create_notification(
                user_id=job.selected_worker_user_id,
                title="Payment received",
                message=f"You received ${amount_value} for job: {job.title}",
                type="payment",
                target_mode="worker",
            )

        # notify poster
        create_notification(
            user_id=job.poster_user_id,
            title="Payment sent",
            message=f"You paid ${amount_value} for job: {job.title}",
            type="payment",
            target_mode="poster",
        )

    except Exception as exc:
        print("NOTIFICATION ERROR:", exc)

    return {
        "message": "Payment marked as paid",
        "payment_status": job.payment_status,
        "paid_at": job.paid_at,
        "stripe_payment_intent_id": job.stripe_payment_intent_id,
    }