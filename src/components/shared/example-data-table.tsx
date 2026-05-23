import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const rows = [
  {
    name: "Inference API",
    owner: "Platform",
    status: "online",
    latency: "82ms",
  },
  {
    name: "Queue Worker",
    owner: "Automation",
    status: "degraded",
    latency: "231ms",
  },
  {
    name: "Billing Sync",
    owner: "Revenue",
    status: "online",
    latency: "104ms",
  },
  {
    name: "Audit Stream",
    owner: "Security",
    status: "offline",
    latency: "n/a",
  },
];

export function ExampleDataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Latency</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-muted-foreground">{row.owner}</TableCell>
            <TableCell>
              <Badge
                variant={
                  row.status === "online"
                    ? "success"
                    : row.status === "degraded"
                      ? "warning"
                      : "danger"
                }
              >
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              {row.latency}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
