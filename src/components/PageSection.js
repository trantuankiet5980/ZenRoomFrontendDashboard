export default function PageSection({ title, description, actions, children, padded = true }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-800">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}

      <div className={padded ? "px-5 py-6" : ""}>{children}</div>
    </section>
  );
}