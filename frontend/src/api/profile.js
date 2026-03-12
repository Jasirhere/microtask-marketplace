import api from "./axios";

export async function getMyProfiles() {
  const res = await api.get("/profiles/me");
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
  const res = await api.get("/mode/current");
  return res.data;
}

export async function switchMode(mode) {
  const res = await api.post("/mode/switch", { mode });
  return res.data;
}