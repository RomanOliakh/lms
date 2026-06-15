"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function safeNext(next: string | null): string | null {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return null;
}

function SignupForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

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
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    // Carry a same-site ?next= through email confirmation so invitees land back on
    // the accept page after verifying. /auth/confirm re-validates next server-side.
    const confirmUrl = next
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=${encodeURIComponent(next)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: confirmUrl,
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
            Check your email
          </h1>
          <p className="text-sm text-n-400">
            We sent a confirmation email to{" "}
            <span className="text-n-700 font-medium">{email}</span>.
            Follow the link in the email to activate your account.
          </p>
          <Link
            href={loginHref}
            className="mt-6 inline-block text-sm text-lms-accent hover:text-lms-accent-600 font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-n-100 border border-n-200 rounded-md shadow-1 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-n-900">Sign up</h1>
          <p className="text-sm text-n-400 mt-1">Create your account</p>
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
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="border-n-200 focus-visible:ring-lms-accent"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-n-700">
              Confirm password
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repeat password"
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
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-n-400">
          Already have an account?{" "}
          <Link href={loginHref} className="text-lms-accent hover:text-lms-accent-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm" />}>
      <SignupForm />
    </Suspense>
  );
}
