"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Programs", href: "/programs", icon: BookOpen },
  { label: "Enrollments", href: "/enrollments", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
            <Image
              src="/ijse-eca.jpg"
              alt="IJSE ECA Logo"
              width={36}
              height={36}
              className="object-cover border-amber-300 border"
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Campus Portal</p>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700">
          <p className="text-xs text-slate-600">Capstone Project</p>
          <p className="text-xs text-slate-500">Enterprise Cloud Architecture</p>
          <p className="text-xs text-slate-600 mt-1">ECA, HDSE @ IJSE</p>
        </div>
      </aside>
    </>
  );
}
