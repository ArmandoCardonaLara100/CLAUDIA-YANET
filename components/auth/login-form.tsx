"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#E8F5EF_0%,#E3EEF7_50%,#EAF4EF_100%)] p-4">
      <div className="w-full max-w-105">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-18 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3D8B6E,#4A7FA5)] shadow-[0_8px_24px_rgba(61,139,110,0.3)]">
            <Heart className="size-9 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#2A6150]">
            PsiConnect
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Plataforma de bienestar psicológico
          </p>
        </div>

        <Card className="border-[rgba(61,139,110,0.12)] shadow-[0_8px_40px_rgba(61,139,110,0.10)]">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Iniciar sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state?.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3"
                    aria-label={
                      showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPass ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={pending}
              >
                {pending ? <Loader2 className="size-5 animate-spin" /> : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          © 2026 PsiConnect · Tu espacio de salud mental
        </p>
      </div>
    </div>
  );
}
