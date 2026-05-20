"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Паролі не співпадають");
      return;
    }

    if (password.length < 6) {
      setError("Пароль має бути не менше 6 символів");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-n-100 border border-n-200 rounded-md shadow-1 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-lms-accent-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-lms-accent text-xl">✓</span>
          </div>
          <h1 className="text-lg font-semibold text-n-900 mb-2">
            Перевірте email
          </h1>
          <p className="text-sm text-n-400">
            Ми надіслали лист підтвердження на{" "}
            <span className="text-n-700 font-medium">{email}</span>.
            Перейдіть за посиланням у листі для активації акаунту.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-lms-accent hover:text-lms-accent-600 font-medium"
          >
            Повернутись до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-n-100 border border-n-200 rounded-md shadow-1 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-n-900">Реєстрація</h1>
          <p className="text-sm text-n-400 mt-1">Створіть свій акаунт</p>
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
              placeholder="Мінімум 6 символів"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="border-n-200 focus-visible:ring-lms-accent"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-n-700">
              Підтвердити пароль
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Повторіть пароль"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
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
            {loading ? "Реєстрація..." : "Зареєструватись"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-n-400">
          Вже є акаунт?{" "}
          <Link href="/login" className="text-lms-accent hover:text-lms-accent-600 font-medium">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
