import { useAuth } from "../auth/AuthContext";

export default function Me() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Me (Protected)</h1>
      <pre className="border rounded-xl p-4">{JSON.stringify(user, null, 2)}</pre>
      <button className="border rounded-lg p-2" onClick={logout}>
        Logout
      </button>
    </div>
  );
}