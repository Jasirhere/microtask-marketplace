import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Me from "./pages/Me";
import ModeSelect from "./pages/ModeSelect";
import PosterProfileSetup from "./pages/PosterProfileSetup";
import WorkerProfileSetup from "./pages/WorkerProfileSetup";
import PosterDashboard from "./pages/PosterDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import PosterJobDetail from "./pages/PosterJobDetail";
import WorkerJobsFeed from "./pages/WorkerJobsFeed";
import WorkerJobDetail from "./pages/WorkerJobDetail";
import WorkerMyJobs from "./pages/WorkerMyJobs";
import WorkerAssignedJobDetail from "./pages/WorkerAssignedJobDetail";
import ChatPage from "./pages/ChatPage";
import PosterProfile from "./pages/PosterProfile";
import WorkerProfile from "./pages/WorkerProfile";
import LandingPage from "./pages/LandingPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <Me />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mode-select"
        element={
          <ProtectedRoute>
            <ModeSelect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/setup/poster"
        element={
          <ProtectedRoute>
            <PosterProfileSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/setup/worker"
        element={
          <ProtectedRoute>
            <WorkerProfileSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/poster"
        element={
          <ProtectedRoute>
            <PosterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker"
        element={
          <ProtectedRoute>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/poster/jobs/:jobId"
        element={
          <ProtectedRoute>
            <PosterJobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/jobs"
        element={
          <ProtectedRoute>
            <WorkerJobsFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/jobs/:jobId"
        element={
          <ProtectedRoute>
            <WorkerJobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/my-jobs"
        element={
          <ProtectedRoute>
            <WorkerMyJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/active-jobs/:jobId"
        element={
          <ProtectedRoute>
            <WorkerAssignedJobDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/poster/profile"
        element={
          <ProtectedRoute>
            <PosterProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <ProtectedRoute>
            <WorkerProfile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}