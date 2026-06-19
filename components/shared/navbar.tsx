"use client";

import { Heart, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";

export function Navbar({ name, role }: { name: string; role: Role }) {
  const initial = name?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[rgba(61,139,110,0.12)] bg-white/95 backdrop-blur-md">
      <div className="flex h-full items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3D8B6E,#4A7FA5)]">
            <Heart className="size-4.5 text-white" />
          </div>
          <span className="font-heading truncate text-lg font-bold text-[#2A6150] sm:text-xl">
            PsiConnect
          </span>
        </div>

        <Badge
          variant="outline"
          className={
            role === "admin"
              ? "hidden border-primary/40 text-primary sm:inline-flex"
              : "hidden border-secondary/40 text-secondary sm:inline-flex"
          }
        >
          {role === "admin" ? "Administrador" : "Paciente"}
        </Badge>

        <div className="flex items-center gap-2">
          <Avatar className="size-8.5">
            <AvatarFallback
              className={
                role === "admin"
                  ? "bg-primary text-xs font-bold text-primary-foreground"
                  : "bg-secondary text-xs font-bold text-secondary-foreground"
              }
            >
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:block">{name}</span>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
