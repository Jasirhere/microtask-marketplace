import api from "./axios";

export async function getJobCategories() {
  const res = await api.get("/jobs/categories");
  return res.data;
}

export async function getMyJobs() {
  const res = await api.get("/jobs/mine");
  return res.data;
}

export async function createJob(payload) {
  const res = await api.post("/jobs", payload);
  return res.data;
}

export async function getJobById(jobId) {
  const res = await api.get(`/jobs/${jobId}`);
  return res.data;
}

export async function getPublicJob(jobId) {
  const res = await api.get(`/jobs/public/${jobId}`);
  return res.data;
}

export async function getOpenJobs(params = {}) {
  const res = await api.get("/jobs/open", { params });
  return res.data;
}

export async function updateJob(jobId, payload) {
  const res = await api.put(`/jobs/${jobId}`, payload);
  return res.data;
}

export async function deleteJob(jobId) {
  const res = await api.delete(`/jobs/${jobId}`);
  return res.data;
}
export async function getWorkerAssignedJob(jobId) {
  const res = await api.get(`/jobs/worker/${jobId}`);
  return res.data;
}