export default function PageShell({ title, description, actions, children, className = "" }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-slate-800">{title}</h1>}
            {description && <p className="text-slate-500">{description}</p>}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      )}

      {children}
    </div>
  );
}