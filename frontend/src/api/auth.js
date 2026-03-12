import api from "./axios";

export async function register(email, password) {
  const res = await api.post("/auth/register", { email, password });
  return res.data; // { access_token, token_type }
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function me() {
  const res = await api.get("/users/me");
  return res.data; // { id, email }
}