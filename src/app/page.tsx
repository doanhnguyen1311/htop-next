import { DatabaseZap } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { AnalyticsPanel } from "@/components/shared/analytics-panel";
import { ExampleDataTable } from "@/components/shared/example-data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  return (
    <PageContainer
      title="Command Dashboard"
      description="A responsive App Router starter with reusable primitives, semantic design tokens, and a production-oriented dashboard structure."
      actions={
        <>
          <Button variant="outline">Export</Button>
          <Button>New workflow</Button>
        </>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Requests"
          value="2.48M"
          change="+18.2%"
          icon="radio"
          tone="primary"
        />
        <StatCard
          title="Compute Load"
          value="68%"
          change="+7.4%"
          icon="cpu"
          tone="accent"
        />
        <StatCard
          title="Healthy Jobs"
          value="12,904"
          change="+11.1%"
          icon="shield"
          tone="success"
        />
        <StatCard
          title="Queue Depth"
          value="341"
          change="+3.8%"
          icon="database"
          tone="warning"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AnalyticsPanel />
        <ActivityFeed />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Service Registry</CardTitle>
              <CardDescription>
                Example table component with semantic status badges.
              </CardDescription>
            </div>
            <Badge variant="accent">
              <LoadingSpinner className="mr-1 size-3" />
              Realtime
            </Badge>
          </CardHeader>
          <CardContent>
            <ExampleDataTable />
          </CardContent>
        </Card>
        <EmptyState
          icon={DatabaseZap}
          title="No incidents queued"
          description="Empty states are reusable and ready for data-fetching flows."
          action={<Button variant="outline">Create rule</Button>}
        />
      </section>
    </PageContainer>
  );
}
