import api from "./axios";

export async function submitReview(payload) {
  const res = await api.post("/reviews", payload);
  return res.data;
}

export async function getJobReviews(jobId) {
  const res = await api.get(`/reviews/job/${jobId}`);
  return res.data;
}

export async function getUserReviews(userId, role) {
  const res = await api.get(`/reviews/user/${userId}?role=${role}`);
  return res.data;
}
export async function getUserStats(userId, role) {
  const res = await api.get(`/reviews/user/${userId}/stats?role=${role}`);
  return res.data;
}