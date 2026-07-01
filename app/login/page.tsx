"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Alert from "@/components/Alert";
import Spinner from "@/components/Spinner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check for error/redirect params from callback or proxy
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_callback_failed") {
      setErrorMsg("Authentication failed. Please try signing in again.");
    } else if (error === "missing_env") {
      setErrorMsg("Server configuration error. Please contact support.");
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
      }
    };
    checkUser();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg("Registration successful! Logging you in...");
          setTimeout(() => {
            const redirect = searchParams.get("redirect") || "/";
            router.push(redirect);
            router.refresh();
          }, 1500);
        } else {
          setSuccessMsg(
            "Registration successful! Please check your email for a verification link."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg("Login successful! Redirecting...");
        setTimeout(() => {
          const redirect = searchParams.get("redirect") || "/";
          router.push(redirect);
          router.refresh();
        }, 1000);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("Auth error:", err);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/8 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              {isSignUp
                ? "Sign up to start listing and booking events"
                : "Sign in to manage and view your tickets"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Error message */}
            {errorMsg && <Alert type="error" message={errorMsg} />}

            {/* Success message */}
            {successMsg && <Alert type="success" message={successMsg} />}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                aria-describedby={errorMsg ? "login-error" : undefined}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-neutral-500">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
            >
              {loading ? (
                <Spinner size="md" className="text-white" />
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-900 px-3 text-neutral-500 tracking-wider">
                or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={async () => {
              setErrorMsg(null);
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
              if (error) {
                setErrorMsg(error.message);
              }
            }}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 py-3 text-sm font-medium text-neutral-200 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white min-h-[44px]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Toggle between Sign In / Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-sm text-neutral-400 hover:text-orange-400 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
