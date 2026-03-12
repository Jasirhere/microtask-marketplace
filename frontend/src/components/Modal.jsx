export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}