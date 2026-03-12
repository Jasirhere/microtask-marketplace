import api from "./axios";

export async function changePassword(payload) {
  const res = await api.post("/account/change-password", payload);
  return res.data;
}

export async function deleteAccount(payload) {
  const res = await api.post("/account/delete", payload);
  return res.data;
}