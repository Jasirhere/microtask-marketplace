import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { WORKER_SKILL_OPTIONS } from "../data/skills";

export default function SkillsMultiSelect({
  value = [],
  onChange,
  error,
  label = "Skills",
  maxSelected = 12,
}) {
  const [search, setSearch] = useState("");

  const selectedSkills = Array.isArray(value) ? value : [];

  const filteredGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return WORKER_SKILL_OPTIONS;

    return WORKER_SKILL_OPTIONS.map((group) => ({
      ...group,
      skills: group.skills.filter((skill) =>
        skill.toLowerCase().includes(keyword)
      ),
    })).filter((group) => group.skills.length > 0);
  }, [search]);

  function toggleSkill(skill) {
    const alreadySelected = selectedSkills.includes(skill);

    if (alreadySelected) {
      onChange(selectedSkills.filter((item) => item !== skill));
      return;
    }

    if (selectedSkills.length >= maxSelected) {
      alert(`You can select up to ${maxSelected} skills.`);
      return;
    }

    onChange([...selectedSkills, skill]);
  }

  function removeSkill(skill) {
    onChange(selectedSkills.filter((item) => item !== skill));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700">
          {label} <span className="text-red-500">*</span>
        </label>

        {selectedSkills.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-slate-500 hover:text-red-600"
          >
            Clear all
          </button>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-100"
            >
              {skill}

              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-blue-500 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className={`rounded-2xl border bg-white p-4 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search skills e.g. cleaning, cooking, moving..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div className="max-h-80 space-y-5 overflow-y-auto pr-1">
          {filteredGroups.length === 0 ? (
            <p className="text-sm text-slate-500">No matching skills found.</p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.group}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {group.group}
                </h3>

                <div className="grid gap-2 sm:grid-cols-2">
                  {group.skills.map((skill) => (
                    <label
                      key={skill}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        selectedSkills.includes(skill)
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="h-4 w-4 rounded"
                      />

                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Select up to {maxSelected} skills relevant to the work you can do.
        </p>

        <p className="text-xs font-medium text-slate-500">
          {selectedSkills.length}/{maxSelected}
        </p>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}