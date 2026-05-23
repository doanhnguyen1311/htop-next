import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const bars = [52, 72, 46, 88, 64, 94, 69, 78, 56, 84, 73, 91];

export function AnalyticsPanel() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Realtime Throughput</CardTitle>
          <CardDescription>
            Requests, jobs, and model events by minute.
          </CardDescription>
        </div>
        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="requests" />
          <TabsContent value="jobs" />
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="bg-background/70 flex h-64 items-end gap-2 rounded-md border p-4">
          {bars.map((height, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="bg-primary/80 hover:bg-accent w-full rounded-t-sm shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_35%,transparent)] transition-all"
                style={{ height: `${height}%` }}
              />
              <span className="text-muted-foreground text-[10px]">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <div className="bg-muted/35 text-muted-foreground flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <Activity className="text-success size-4" />
            Stream healthy
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
