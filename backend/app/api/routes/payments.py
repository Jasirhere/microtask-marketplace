from pydantic import BaseModel
import stripe

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.services.application_store import get_applications_for_job
from app.services.job_store import (
    get_job_by_id,
    mark_job_as_paid,
    save_payment_intent,
)
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
def create_payment_intent(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured")

    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the poster can release payment")

    if job.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Payment is only available after job completion")

    if job.payment_status == "PAID":
        raise HTTPException(status_code=400, detail="This job has already been paid")

    applications = get_applications_for_job(db, job.id)

    selected_app = next(
        (app for app in applications if app.status == "SELECTED"),
        None,
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
                "worker_user_id": selected_app.worker_user_id,
            },
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    updated_job = save_payment_intent(db, job.id, intent.id)

    if not updated_job:
        raise HTTPException(status_code=500, detail="Failed to save payment intent")

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
    db: Session = Depends(get_db),
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured")

    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the poster can mark payment as paid")

    if job.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Only completed jobs can be paid")

    if job.payment_status == "PAID":
        return {
            "message": "Job already paid",
            "payment_status": job.payment_status,
            "paid_at": job.paid_at,
            "stripe_payment_intent_id": job.stripe_payment_intent_id,
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

    applications = get_applications_for_job(db, job.id)

    selected_app = next(
        (app for app in applications if app.status == "SELECTED"),
        None,
    )

    if not selected_app:
        raise HTTPException(status_code=400, detail="No selected application found")

    updated_job = mark_job_as_paid(db, job.id, intent.id)

    if not updated_job:
        raise HTTPException(status_code=500, detail="Failed to mark job as paid")

    amount_value = updated_job.final_price or selected_app.proposed_rate

    try:
        create_notification(
            db=db,
            user_id=selected_app.worker_user_id,
            title="Payment received",
            message=f"You received ${amount_value} for job: {job.title}",
            type="PAYMENT_RECEIVED",
            target_mode="worker",
            job_title=job.title,
        )

        create_notification(
            db=db,
            user_id=job.poster_user_id,
            title="Payment sent",
            message=f"You paid ${amount_value} for job: {job.title}",
            type="PAYMENT_SENT",
            target_mode="poster",
            job_title=job.title,
        )

    except Exception as exc:
        print("NOTIFICATION ERROR:", exc)

    return {
        "message": "Payment marked as paid",
        "payment_status": updated_job.payment_status,
        "paid_at": updated_job.paid_at,
        "stripe_payment_intent_id": updated_job.stripe_payment_intent_id,
    }