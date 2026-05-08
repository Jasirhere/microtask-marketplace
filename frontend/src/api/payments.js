import api from "./axios";

export async function createPaymentIntent(jobId) {
  const res = await api.post(`/payments/create-intent/${jobId}`);
  return res.data;
}

export async function markJobPaid(jobId, paymentIntentId) {
  const res = await api.post(`/payments/mark-paid/${jobId}`, {
    payment_intent_id: paymentIntentId,
  });
  return res.data;
}