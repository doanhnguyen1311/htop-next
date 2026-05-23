"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Cpu,
  DatabaseZap,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const icons = {
  cpu: Cpu,
  database: DatabaseZap,
  radio: RadioTower,
  shield: ShieldCheck,
};

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof icons;
  tone?: "primary" | "accent" | "success" | "warning";
};

export function StatCard({
  title,
  value,
  change,
  icon,
  tone = "primary",
}: StatCardProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="bg-card/88 overflow-hidden backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {title}
          </CardTitle>
          <span
            className={cn(
              "rounded-md border p-2",
              tone === "primary" &&
                "border-primary/25 bg-primary/10 text-primary",
              tone === "accent" && "border-accent/25 bg-accent/10 text-accent",
              tone === "success" &&
                "border-success/25 bg-success/10 text-success",
              tone === "warning" &&
                "border-warning/25 bg-warning/10 text-warning",
            )}
          >
            <Icon className="size-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                {value}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Live window</p>
            </div>
            <Badge variant={tone === "primary" ? "default" : tone}>
              <ArrowUpRight className="mr-1 size-3" />
              {change}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
