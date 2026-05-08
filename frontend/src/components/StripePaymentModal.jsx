import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Lock, X } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function StripeCheckoutForm({
  amount,
  paymentIntentId,
  jobId,
  onClose,
  onSuccess,
  markJobPaid,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is still loading. Try again.");
      return;
    }

    setProcessing(true);
    setError("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Payment failed.");
      setProcessing(false);
      return;
    }

    await markJobPaid(jobId, paymentIntentId);

    setProcessing(false);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="border-b px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Payment Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete your payment using Stripe Test Mode
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-5">
          <span className="text-slate-600">Amount to pay</span>
          <span className="text-3xl font-semibold text-blue-600">
            ${Number(amount).toFixed(2)}
          </span>
        </div>

        <PaymentElement />

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <Lock className="h-5 w-5 text-green-600" />
          Stripe securely handles the card details. Your app does not store them.
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="border-t px-6 py-5">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          <Lock className="h-5 w-5" />
          {processing ? "Processing..." : `Pay $${Number(amount).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  clientSecret,
  amount,
  paymentIntentId,
  jobId,
  onSuccess,
  markJobPaid,
}) {
  if (!isOpen || !clientSecret) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <StripeCheckoutForm
            amount={amount}
            paymentIntentId={paymentIntentId}
            jobId={jobId}
            onClose={onClose}
            onSuccess={onSuccess}
            markJobPaid={markJobPaid}
          />
        </Elements>
      </div>
    </div>
  );
}