import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Me from "./pages/Me";
import ModeSelect from "./pages/ModeSelect";

import PosterProfileSetup from "./pages/PosterProfileSetup";
import WorkerProfileSetup from "./pages/WorkerProfileSetup";

import PosterDashboard from "./pages/PosterDashboard";
import PosterJobDetail from "./pages/PosterJobDetail";
import PosterReleasePayment from "./pages/PosterReleasePayment";
import PosterProfile from "./pages/PosterProfile";

import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerJobsFeed from "./pages/WorkerJobsFeed";
import WorkerJobDetail from "./pages/WorkerJobDetail";
import WorkerMyJobs from "./pages/WorkerMyJobs";
import WorkerAssignedJobDetail from "./pages/WorkerAssignedJobDetail";
import WorkerProfile from "./pages/WorkerProfile";

import ChatPage from "./pages/ChatPage";

function ProtectedPage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/me"
        element={
          <ProtectedPage>
            <Me />
          </ProtectedPage>
        }
      />

      <Route
        path="/mode-select"
        element={
          <ProtectedPage>
            <ModeSelect />
          </ProtectedPage>
        }
      />

      <Route
        path="/setup/poster"
        element={
          <ProtectedPage>
            <PosterProfileSetup />
          </ProtectedPage>
        }
      />

      <Route
        path="/setup/worker"
        element={
          <ProtectedPage>
            <WorkerProfileSetup />
          </ProtectedPage>
        }
      />

      <Route
        path="/poster"
        element={
          <ProtectedPage>
            <PosterDashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/poster/jobs/:jobId"
        element={
          <ProtectedPage>
            <PosterJobDetail />
          </ProtectedPage>
        }
      />

      <Route
        path="/poster/jobs/:jobId/payment"
        element={
          <ProtectedPage>
            <PosterReleasePayment />
          </ProtectedPage>
        }
      />

      <Route
        path="/poster/profile"
        element={
          <ProtectedPage>
            <PosterProfile />
          </ProtectedPage>
        }
      />

      <Route
        path="/posters/:userId"
        element={
          <ProtectedPage>
            <PosterProfile />
          </ProtectedPage>
        }
      />

      <Route
        path="/worker"
        element={
          <ProtectedPage>
            <WorkerDashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/worker/jobs"
        element={
          <ProtectedPage>
            <WorkerJobsFeed />
          </ProtectedPage>
        }
      />

      <Route
        path="/worker/jobs/:jobId"
        element={
          <ProtectedPage>
            <WorkerJobDetail />
          </ProtectedPage>
        }
      />

      <Route
        path="/worker/my-jobs"
        element={
          <ProtectedPage>
            <WorkerMyJobs />
          </ProtectedPage>
        }
      />

      <Route
        path="/worker/active-jobs/:jobId"
        element={
          <ProtectedPage>
            <WorkerAssignedJobDetail />
          </ProtectedPage>
        }
      />

      <Route
        path="/worker/profile"
        element={
          <ProtectedPage>
            <WorkerProfile />
          </ProtectedPage>
        }
      />

      <Route
        path="/workers/:userId"
        element={
          <ProtectedPage>
            <WorkerProfile />
          </ProtectedPage>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedPage>
            <ChatPage />
          </ProtectedPage>
        }
      />

      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">404</h1>

              <p className="mt-2 text-sm text-slate-600">
                The page you are looking for does not exist.
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}