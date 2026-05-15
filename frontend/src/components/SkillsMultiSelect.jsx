const SKILL_OPTIONS = [
  "Cleaning",
  "Moving",
  "Delivery",
  "Furniture Assembly",
  "Handyman",
  "Gardening",
  "Painting",
  "Electrical",
  "Plumbing",
  "Car Wash",
  "Pet Care",
  "Tutoring",
  "Event Help",
  "Shopping Help",
  "Other",
];

export default function SkillsMultiSelect({
  value = [],
  onChange,
  error,
  label = "Skills Required",
  maxSelected = 5,
}) {
  const selectedValues = Array.isArray(value) ? value : [];

  function handleToggle(skill) {
    const alreadySelected = selectedValues.includes(skill);

    if (alreadySelected) {
      onChange(selectedValues.filter((item) => item !== skill));
      return;
    }

    if (selectedValues.length >= maxSelected) {
      return;
    }

    onChange([...selectedValues, skill]);
  }

  function handleRemove(skill) {
    onChange(selectedValues.filter((item) => item !== skill));
  }

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-semibold text-slate-700">
          {label} *
        </label>

        <span className="text-xs text-slate-500">
          {selectedValues.length}/{maxSelected} selected
        </span>
      </div>

      {selectedValues.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedValues.map((skill) => (
            <span
              key={skill}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
            >
              <span className="min-w-0 break-words">{skill}</span>

              <button
                type="button"
                onClick={() => handleRemove(skill)}
                className="shrink-0 rounded-full text-blue-500 hover:text-blue-800"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className={`rounded-xl border bg-white p-3 ${
          error ? "border-red-500 bg-red-50" : "border-slate-300"
        }`}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_OPTIONS.map((skill) => {
            const isSelected = selectedValues.includes(skill);
            const isDisabled =
              !isSelected && selectedValues.length >= maxSelected;

            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleToggle(skill)}
                disabled={isDisabled}
                className={`min-w-0 rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isDisabled
                    ? "border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <span className="block break-words">{skill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {!error && (
        <p className="mt-1 text-xs text-slate-500">
          Select the work types most relevant to this job.
        </p>
      )}
    </div>
  );
}