"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check active session on mount
    const getInitialSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen dynamically to auth state changes (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-orange-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-1.5 group" aria-label="AuraEvents Home">
          <span className="text-xl font-bold tracking-tight text-white transition-opacity group-hover:opacity-90">
            Aura
          </span>
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
          <span className="text-xl font-bold tracking-tight text-white transition-opacity group-hover:opacity-90">
            Events
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden sm:flex items-center gap-3" aria-label="Main navigation">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-neutral-800" aria-hidden="true" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : "border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/create"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive("/create")
                    ? "bg-orange-700 text-white shadow-sm"
                    : "bg-orange-600 text-white shadow-sm hover:bg-orange-700 active:scale-[0.97]"
                }`}
              >
                Create Event
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-lg border border-neutral-700 bg-neutral-800/60 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-orange-600 px-4 py-2 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-600 hover:text-white"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden flex items-center justify-center h-10 w-10 rounded-lg border border-neutral-700 bg-neutral-800/60 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          className="sm:hidden border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-md"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-2">
            {loading ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-800" aria-hidden="true" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/create"
                  className="block rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white text-center shadow-sm transition-colors hover:bg-orange-700"
                >
                  Create Event
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left rounded-lg px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block rounded-lg border border-orange-600 px-4 py-3 text-sm font-semibold text-orange-500 text-center transition-colors hover:bg-orange-600 hover:text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
