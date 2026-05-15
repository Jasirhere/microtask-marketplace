import { Upload, X } from "lucide-react";

export default function ProfilePhotoUpload({
  id = "profile-photo-upload",
  value,
  onChange,
  label = "Profile photo",
  error,
}) {
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function handleRemove() {
    onChange("");
  }

  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div
        className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center ${
          error ? "border-red-500 bg-red-50" : "border-slate-300"
        }`}
      >
        <div className="shrink-0">
          {value ? (
            <img
              src={value}
              alt="Profile preview"
              className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
              <Upload className="h-7 w-7" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-medium text-slate-900">
            Upload a clear profile photo
          </p>

          <p className="mt-1 break-words text-xs leading-5 text-slate-500">
            Use a square image where possible. JPG, PNG, or WebP works best.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label
              htmlFor={id}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              Choose Photo
            </label>

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}