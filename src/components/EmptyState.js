export default function EmptyState({
  title,
  description,
  action,
  icon = (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 6v6l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-700">
        {icon}
      </div>
      {title && <div className="text-lg font-semibold text-slate-800">{title}</div>}
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action ? <div className="flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
    </div>
  );
}