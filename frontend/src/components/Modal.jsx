export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-0 sm:items-center sm:px-4">
      <div
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <section className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="min-w-0 truncate text-lg font-semibold text-slate-900 sm:text-xl">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Close
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </section>
    </div>
  );
}