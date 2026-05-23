import {
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

export const appConfig = {
  name: "Nexus Console",
  description: "Realtime operations dashboard starter",
};

export const navigationItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Form", href: "/form", icon: FileText },
  { title: "Data", href: "/data", icon: Database },
  { title: "Analytics", href: "/", icon: BarChart3 },
  { title: "Settings", href: "/", icon: Settings2 },
];
