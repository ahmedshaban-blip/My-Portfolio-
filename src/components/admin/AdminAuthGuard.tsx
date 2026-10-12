import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_SESSION_KEY = "cv-vault-authenticated";
export const ADMIN_PIN_SESSION_KEY = "cv-vault-pin";

type AdminAuthGuardProps = {
  children: ReactNode;
};

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const adminPin = import.meta.env.VITE_ADMIN_PIN ?? "";
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const lockSeconds = useMemo(() => {
    const remainingMs = lockedUntil - now;
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  }, [lockedUntil, now]);

  useEffect(() => {
    if (!lockedUntil || Date.now() >= lockedUntil) return;

    const timer = window.setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(0);
        setError("");
      } else {
        setNow(Date.now());
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!adminPin) {
      setError("Admin PIN is not configured.");
      return;
    }

    if (Date.now() < lockedUntil) {
      setError(`Too many attempts. Try again in ${lockSeconds}s.`);
      return;
    }

    if (pin === adminPin) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      sessionStorage.setItem(ADMIN_PIN_SESSION_KEY, pin);
      setIsAuthenticated(true);
      setError("");
      return;
    }

    const nextAttempts = failedAttempts + 1;
    const delayMs = Math.min(30_000, nextAttempts * 1_500);
    setNow(Date.now());
    setFailedAttempts(nextAttempts);
    setLockedUntil(Date.now() + delayMs);
    setPin("");
    setError(`Invalid PIN. Locked for ${Math.ceil(delayMs / 1000)}s.`);
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <main className="min-h-screen px-4 py-24 flex items-center justify-center">
      <Card className="modern-card glass-effect w-full max-w-md overflow-hidden">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 glow-primary">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-gradient text-3xl font-extrabold tracking-tight">CV Vault</CardTitle>
            <CardDescription>Enter the private PIN to manage portfolio CV assets.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-pin">Admin PIN</Label>
              <Input
                id="admin-pin"
                type="password"
                inputMode="text"
                autoComplete="current-password"
                value={pin}
                disabled={lockSeconds > 0}
                onChange={(event) => setPin(event.target.value)}
                className="h-12 rounded-xl bg-background/70"
                placeholder="••••••••••••"
              />
            </div>
            {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
            <Button className="h-12 w-full rounded-full shadow-lg shadow-primary/20" disabled={lockSeconds > 0 || !pin}>
              {lockSeconds > 0 ? `Try again in ${lockSeconds}s` : "Unlock Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
