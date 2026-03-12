import { useEffect, useRef, useState } from "react";

export default function AccountMenu({ onAccountSettings, onLogout, photoSrc, fallbackLabel = "U" }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="h-12 w-12 overflow-hidden rounded-full border bg-slate-100"
      >
        {photoSrc ? (
          <img src={photoSrc} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
            {fallbackLabel}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border bg-white p-2 shadow-xl z-50">
          <button
            onClick={() => {
              setOpen(false);
              onAccountSettings();
            }}
            className="block w-full rounded-xl px-4 py-3 text-left text-slate-700 hover:bg-slate-50"
          >
            Account settings
          </button>

          <div className="my-2 border-t" />

          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="block w-full rounded-xl px-4 py-3 text-left text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}