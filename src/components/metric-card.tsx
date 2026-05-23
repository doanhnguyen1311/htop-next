import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  status?: "online" | "warning" | "danger" | "muted";
  children?: React.ReactNode;
};

export function MetricCard({
  label,
  value,
  detail,
  status = "muted",
  children,
}: MetricCardProps) {
  return (
    <section className="rounded-md border border-emerald-400/20 bg-zinc-950/85 p-4 shadow-[0_0_24px_rgba(34,197,94,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-semibold tabular-nums",
              status === "online" && "text-emerald-300",
              status === "warning" && "text-amber-300",
              status === "danger" && "text-rose-300",
              status === "muted" && "text-zinc-100",
            )}
          >
            {value}
          </p>
        </div>
        {detail ? (
          <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 font-mono text-xs text-cyan-200">
            {detail}
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
