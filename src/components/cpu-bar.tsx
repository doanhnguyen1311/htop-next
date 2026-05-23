import { cn } from "@/lib/utils";

type CpuBarProps = {
  usage: number;
  cores?: Array<{ id: number; usage: number }>;
};

export function CpuBar({ usage, cores = [] }: CpuBarProps) {
  return (
    <div className="space-y-3">
      <UsageBar value={usage} label="CPU" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {cores.slice(0, 16).map((core) => (
          <div key={core.id} className="space-y-1">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <span>c{core.id}</span>
              <span>{core.usage.toFixed(0)}%</span>
            </div>
            <UsageBar value={core.usage} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsageBar({
  value,
  label,
  compact = false,
}: {
  value: number;
  label?: string;
  compact?: boolean;
}) {
  const danger = value >= 85;
  const warning = value >= 70 && value < 85;

  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
          <span>{label}</span>
          <span>{value.toFixed(1)}%</span>
        </div>
      ) : null}
      <div
        className={cn(
          "overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900",
          compact ? "h-2" : "h-4",
        )}
      >
        <div
          className={cn(
            "h-full transition-[width,background-color] duration-500 ease-out",
            danger && "bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.55)]",
            warning && "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.45)]",
            !danger &&
              !warning &&
              "bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.5)]",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
