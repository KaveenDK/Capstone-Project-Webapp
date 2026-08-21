"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Manage Students",
  "/programs": "Manage Programs",
  "/enrollments": "Manage Enrollments",
};

function getTitle(pathname: string) {
  for (const [key, val] of Object.entries(titles)) {
    if (pathname === key || pathname.startsWith(key + "/")) return val;
  }
  return "Campus Portal";
}

export function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
    </header>
  );
}
