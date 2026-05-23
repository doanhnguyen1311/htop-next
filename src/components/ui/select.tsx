"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
};

export type SelectOptionGroup = {
  label?: string;
  options: SelectOption[];
};

export type SelectProps = {
  options: SelectOption[] | SelectOptionGroup[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  labelClassName?: string;
};

function isOptionGroup(
  item: SelectOption | SelectOptionGroup,
): item is SelectOptionGroup {
  return "options" in item;
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

function SelectItem({ option }: { option: SelectOption }) {
  return (
    <SelectPrimitive.Item
      value={option.value}
      disabled={option.disabled}
      className={cn(
        "focus:bg-muted relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      )}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        <span className="flex flex-col gap-0.5">
          <span>{option.label}</span>
          {option.description ? (
            <span className="text-muted-foreground text-xs">
              {option.description}
            </span>
          ) : null}
        </span>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  label,
  helperText,
  error,
  disabled,
  required,
  name,
  id,
  className,
  triggerClassName,
  contentClassName,
  labelClassName,
}: SelectProps) {
  const selectId = React.useId();
  const fieldId = id ?? selectId;
  const hasError = Boolean(error);

  return (
    <div className={cn("grid gap-2", className)}>
      {label ? (
        <Label htmlFor={fieldId} className={labelClassName}>
          {label}
          {required ? <span className="text-danger ml-1">*</span> : null}
        </Label>
      ) : null}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectPrimitive.Trigger
          id={fieldId}
          aria-invalid={hasError}
          className={cn(
            "bg-input text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-ring/45 flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            hasError &&
              "border-danger/60 focus-visible:border-danger focus-visible:ring-danger/40",
            triggerClassName,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="size-4 opacity-60" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            className={cn(
              "bg-popover text-popover-foreground relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-xl data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
              contentClassName,
            )}
          >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport className="h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] p-1">
              {options.map((item, index) => {
                if (isOptionGroup(item)) {
                  return (
                    <SelectPrimitive.Group key={item.label ?? index}>
                      {item.label ? (
                        <SelectPrimitive.Label className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                          {item.label}
                        </SelectPrimitive.Label>
                      ) : null}
                      {item.options.map((option) => (
                        <SelectItem key={option.value} option={option} />
                      ))}
                    </SelectPrimitive.Group>
                  );
                }

                return <SelectItem key={item.value} option={item} />;
              })}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error ? (
        <p className="text-danger text-xs">{error}</p>
      ) : helperText ? (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      ) : null}
    </div>
  );
}
