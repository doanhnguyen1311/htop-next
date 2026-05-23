import { SearchX } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { ExampleDataTable } from "@/components/shared/example-data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

export default function DataPage() {
  return (
    <PageContainer
      title="Data Table"
      description="A focused example of responsive data display, filtering controls, table composition, and empty-state handling."
    >
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Operational health across active services.
            </CardDescription>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input className="sm:w-72" placeholder="Filter services..." />
            <Button variant="outline">Filter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ExampleDataTable />
        </CardContent>
      </Card>
      <EmptyState
        icon={SearchX}
        title="No archived runs"
        description="When filters return nothing, keep the layout useful and action-oriented."
        action={<Button variant="ghost">Reset filters</Button>}
      />
    </PageContainer>
  );
}
