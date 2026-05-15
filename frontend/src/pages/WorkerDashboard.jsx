import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function WorkerDashboard() {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (!user?.worker_profile) {
    return <Navigate to="/setup/worker" replace />;
  }

  return <Navigate to="/worker/jobs" replace />;
}