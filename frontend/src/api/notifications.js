import api from "./axios";

export async function getNotifications(targetMode) {
  const res = await api.get("/notifications", {
    params: { target_mode: targetMode },
  });
  return res.data;
}

export async function getUnreadNotificationsCount(targetMode) {
  const res = await api.get("/notifications/unread-count", {
    params: { target_mode: targetMode },
  });
  return res.data;
}

export async function markAllNotificationsRead(targetMode) {
  const res = await api.post("/notifications/mark-all-read", null, {
    params: { target_mode: targetMode },
  });
  return res.data;
}