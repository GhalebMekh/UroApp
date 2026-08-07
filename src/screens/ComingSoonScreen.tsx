/** Placeholder for workspaces from the 18-screen blueprint not yet built. */
export function ComingSoonScreen({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-wrap px-6 py-16">
      <div className="mx-auto max-w-lg rounded-[20px] border border-line bg-navy-2 p-8 text-center">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
          On the roadmap
        </div>
        <h2 className="mb-3 font-display text-[28px] font-semibold">{title}</h2>
        <p className="text-[15px] text-muted">{blurb}</p>
      </div>
    </div>
  );
}
