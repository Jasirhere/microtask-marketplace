const STATUS_STYLES = {
  OPEN: {
    label: "Open",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

function formatStatus(status) {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function JobStatusBadge({ status }) {
  const config = STATUS_STYLES[status] || {
    label: formatStatus(status),
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-semibold leading-5 ${config.className}`}
    >
      <span className="min-w-0 break-words">{config.label}</span>
    </span>
  );
}