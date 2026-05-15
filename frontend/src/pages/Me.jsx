import { useAuth } from "../auth/AuthContext";

export default function Me() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <main className="mx-auto w-full max-w-5xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold text-slate-900 sm:text-2xl">
                Me
              </h1>

              <p className="mt-1 break-words text-sm text-slate-600">
                Protected user session details.
              </p>
            </div>

            <button
              className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 sm:w-auto"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <pre className="max-h-[70vh] overflow-auto p-4 text-xs leading-6 text-slate-100 sm:text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}