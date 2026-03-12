import api from "./axios";

export async function changePassword(payload) {
  const res = await api.post("/account/change-password", payload);
  return res.data;
}

export async function deleteAccount(payload) {
  const res = await api.post("/account/delete", payload);
  return res.data;
}

// kept for compatibility; ultimately front-end should call deleteAccount
export async function deactivateAccount(payload) {
  console.warn("deactivateAccount() is deprecated, use deleteAccount()");
  return deleteAccount(payload);
}