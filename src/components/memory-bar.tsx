import { UsageBar } from "@/components/cpu-bar";

type MemoryBarProps = {
  usage: number;
  used: number;
  total: number;
};

function formatBytes(bytes: number) {
  const gib = bytes / 1024 / 1024 / 1024;
  return `${gib.toFixed(1)} GiB`;
}

export function MemoryBar({ usage, used, total }: MemoryBarProps) {
  return (
    <div className="space-y-2">
      <UsageBar value={usage} label="RAM" />
      <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(total)} total</span>
      </div>
    </div>
  );
}
