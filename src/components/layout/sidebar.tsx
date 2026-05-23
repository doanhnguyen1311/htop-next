"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigationItems, appConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "bg-card/95 fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r backdrop-blur-xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
              <Activity className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {appConfig.name}
              </span>
              <span className="text-muted-foreground block text-xs">
                Ops layer
              </span>
            </span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navigationItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active && "bg-primary/12 text-primary ring-primary/20 ring-1",
                )}
              >
                <item.icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="bg-background/70 rounded-md border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Network</span>
              <span className="text-success font-medium">99.98%</span>
            </div>
            <div className="bg-muted mt-3 h-1.5 rounded-full">
              <div className="bg-accent h-full w-[86%] rounded-full shadow-[0_0_18px_var(--accent)]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
