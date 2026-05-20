"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-n-100 border border-n-200 rounded-md shadow-1 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-n-900">Вхід</h1>
          <p className="text-sm text-n-400 mt-1">Введіть свої дані для входу</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-n-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-n-200 focus-visible:ring-lms-accent"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-n-700">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border-n-200 focus-visible:ring-lms-accent"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-lms-accent hover:bg-lms-accent-600 text-white"
          >
            {loading ? "Вхід..." : "Увійти"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-n-400">
          Немає акаунту?{" "}
          <Link href="/signup" className="text-lms-accent hover:text-lms-accent-600 font-medium">
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
