import { CheckCircle2, CircleAlert, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const events = [
  {
    title: "Edge region synchronized",
    time: "24s ago",
    icon: RadioTower,
    variant: "accent" as const,
  },
  {
    title: "Billing worker recovered",
    time: "2m ago",
    icon: CheckCircle2,
    variant: "success" as const,
  },
  {
    title: "Queue latency near threshold",
    time: "8m ago",
    icon: CircleAlert,
    variant: "warning" as const,
  },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Feed</CardTitle>
        <CardDescription>
          Recent events across the control plane.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.title} className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-md border">
              <event.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="text-muted-foreground text-xs">{event.time}</p>
            </div>
            <Badge variant={event.variant}>Live</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
