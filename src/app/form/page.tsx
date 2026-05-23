import { PageContainer } from "@/components/layout/page-container";
import { ProjectForm } from "@/components/shared/project-form";
import { Badge } from "@/components/ui/badge";

export default function FormPage() {
  return (
    <PageContainer
      title="Form Example"
      description="Composable inputs, labels, textarea, separators, buttons, and dialog primitives in a clean settings-style page."
      actions={<Badge variant="success">Draft autosaved</Badge>}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,720px)_1fr]">
        <ProjectForm />
        <aside className="bg-card text-muted-foreground rounded-lg border p-5 text-sm">
          <h2 className="text-foreground text-base font-semibold">
            Implementation notes
          </h2>
          <p className="mt-3 leading-6">
            This page stays server-rendered while the Radix dialog hydrates only
            where interaction is needed. The same primitives can back settings,
            onboarding, and CRUD workflows.
          </p>
        </aside>
      </div>
    </PageContainer>
  );
}
