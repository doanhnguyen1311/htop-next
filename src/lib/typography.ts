import { cn } from "@/lib/utils";

export const typography = {
  pageTitle:
    "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
  pageDescription:
    "max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base",
  sectionTitle: "text-base font-semibold tracking-tight text-foreground",
};

export function proseClassName(className?: string) {
  return cn(
    "leading-7 text-muted-foreground [&_strong]:text-foreground",
    className,
  );
}
