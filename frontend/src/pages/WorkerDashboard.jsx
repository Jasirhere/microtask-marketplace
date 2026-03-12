import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function WorkerDashboard() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user?.worker_profile) {
    return <Navigate to="/setup/worker" replace />;
  }

  return <Navigate to="/worker/jobs" replace />;
}