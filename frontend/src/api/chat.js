import api from "./axios";

export async function getMyChats() {
  const res = await api.get("/chat/my-chats");
  return res.data;
}

export async function getChatMessages(jobId) {
  const res = await api.get(`/chat/${jobId}`);
  return res.data;
}