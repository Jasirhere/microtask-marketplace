import { Camera, Plus, X } from "lucide-react";

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

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    const maxSizeInMb = 2;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      alert(`Image must be less than ${maxSizeInMb}MB.`);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  }

  function handleRemovePhoto() {
    onChange("");
  }

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-5">
        <div className="relative">
          <label
            htmlFor={id}
            className={`flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed bg-slate-50 transition hover:bg-slate-100 ${
              error ? "border-red-400" : "border-slate-300"
            }`}
          >
            {value ? (
              <img
                src={value}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-slate-400" />
            )}

            <input
              id={id}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <label
            htmlFor={id}
            className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </label>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-900">
            Upload a clear profile photo
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            JPG, PNG, or WEBP. Max size 2MB.
          </p>

          {value && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <X className="h-3 w-3" />
              Remove photo
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}