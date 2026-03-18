import api from "./axios";

export async function applyToJob(payload) {
  const res = await api.post("/applications", payload);
  return res.data;
}

export async function getMyApplications() {
  const res = await api.get("/applications/mine");
  return res.data;
}

export async function getMyWorkerJobs() {
  const res = await api.get("/applications/my-jobs");
  return res.data;
}

export async function getApplicationsForJob(jobId) {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data;
}

export async function acceptApplication(applicationId) {
  const res = await api.post(`/applications/${applicationId}/accept`);
  return res.data;
}

export async function rejectApplication(applicationId) {
  const res = await api.post(`/applications/${applicationId}/reject`);
  return res.data;
}