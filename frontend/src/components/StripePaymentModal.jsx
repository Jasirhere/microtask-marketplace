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
    <form onSubmit={handleSubmit} className="flex max-h-[92vh] flex-col">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
            Payment Details
          </h2>

          <p className="mt-1 break-words text-sm leading-6 text-slate-500">
            Complete your payment using Stripe Test Mode.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close payment modal"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <span className="text-sm text-slate-600 sm:text-base">
            Amount to pay
          </span>

          <span className="break-words text-2xl font-semibold text-blue-600 sm:text-3xl">
            ${Number(amount).toFixed(2)}
          </span>
        </div>
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="mb-2 font-semibold">Test card details</p>

          <div className="space-y-1">
            <p><span className="font-medium">Card:</span> 4242 4242 4242 4242</p>
            <p><span className="font-medium">Expiry:</span> 10/36</p>
            <p><span className="font-medium">CVC:</span> 123</p>
            <p><span className="font-medium">Name:</span> Test User</p>
            <p><span className="font-medium">Email:</span> testuser@gmail.com</p>
          </div>

          <p className="mt-2 text-xs text-blue-700">
            Use these details only in Stripe test mode.
          </p>
        </div>
        <div className="min-w-0">
          <PaymentElement />
        </div>

        <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

          <p className="break-words">
            Stripe securely handles the card details. Your app does not store
            them.
          </p>
        </div>

        {error && (
          <div className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:py-4 sm:text-base"
        >
          <Lock className="h-5 w-5 shrink-0" />

          <span className="min-w-0 break-words">
            {processing ? "Processing..." : `Pay $${Number(amount).toFixed(2)}`}
          </span>
        </button>
      </footer>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0 backdrop-blur-sm sm:items-center sm:px-4">
      <section className="w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
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
      </section>
    </div>
  );
}