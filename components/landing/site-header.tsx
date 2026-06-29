"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, LockOpen, Menu, X } from "lucide-react";

const LINKS = [
  ["#about", "Sobre mí"],
  ["#specialties", "Especialidades"],
  ["#education", "Formación"],
  ["#reviews", "Reseñas"],
  ["#location", "Ubicación"],
  ["#contact", "Contacto"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(61,139,110,0.10)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-280 px-4 sm:px-6">
        <nav className="flex h-17 items-center justify-between gap-4">
          <Link href="#top" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3D8B6E,#4A7FA5)]">
              <Heart className="size-5 text-white" />
            </span>
            <span className="flex flex-col leading-tight">
              <strong className="text-sm font-bold text-[#2A6150]">
                Claudia Yanet Lara Gómez
              </strong>
              <span className="text-muted-foreground text-xs">
                Psicoterapeuta
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-muted-foreground hover:bg-muted hover:text-primary rounded-full px-3.5 py-1.5 text-sm font-medium transition"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-primary bg-muted inline-flex items-center gap-1.5 rounded-full border border-[rgba(61,139,110,0.18)] px-4 py-2 text-sm font-semibold transition hover:shadow-md"
            >
              <LockOpen className="size-4" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
            <button
              type="button"
              className="text-foreground p-1.5 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Abrir menú"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-[rgba(61,139,110,0.10)] bg-white px-4 py-3 lg:hidden">
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-muted rounded-md px-3.5 py-2.5 text-sm font-medium"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
