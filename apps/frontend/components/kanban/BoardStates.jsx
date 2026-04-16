"use client";

const BoardStats = ({ items }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_rgba(15,23,42,0.06)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {item.label}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>
              {item.caption}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardStats;