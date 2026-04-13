import api from "./axios";

export async function getCompletionStatus(jobId) {
  const res = await api.get(`/completion/${jobId}`);
  return res.data;
}

export async function markJobCompleted(jobId) {
  const res = await api.post(`/completion/${jobId}/mark`);
  return res.data;
}