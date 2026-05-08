import api from "./axios";

export async function getMyProfiles() {
  const res = await api.get("/profiles/me");
  return res.data;
}

export async function getWorkerProfile(userId) {
  const res = await api.get(`/profiles/worker/${userId}`);
  return res.data;
}

export async function getPosterProfile(userId) {
  const res = await api.get(`/profiles/poster/${userId}`);
  return res.data;
}

export async function createPosterProfile(payload) {
  const res = await api.post("/profiles/poster", payload);
  return res.data;
}

export async function createWorkerProfile(payload) {
  const res = await api.post("/profiles/worker", payload);
  return res.data;
}

export async function getCurrentMode() {
  const res = await api.get("/profiles/mode/current");
  return res.data;
}

export async function switchMode(mode) {
  const res = await api.post("/profiles/mode/switch", { mode });
  return res.data;
}