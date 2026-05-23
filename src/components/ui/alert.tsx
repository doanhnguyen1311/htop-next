import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4 text-sm", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      destructive:
        "border-danger/40 bg-danger/10 text-danger [&>svg]:text-danger",
      success:
        "border-success/40 bg-success/10 text-success [&>svg]:text-success",
      warning:
        "border-warning/40 bg-warning/10 text-warning [&>svg]:text-warning",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        alertVariants({ variant }),
        "[&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg~*]:pl-7",
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 leading-none font-medium tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}
