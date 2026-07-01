"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { formatEventDate, formatPrice } from "@/utils/format";
import Alert from "@/components/Alert";
import Spinner from "@/components/Spinner";
import type { Event } from "@/types/event";
import { MapPin, Calendar, ArrowRight, Sparkles, SlidersHorizontal } from "lucide-react";

type PriceFilter = "all" | "free" | "paid";
type SortOption = "date_asc" | "price_asc";

function HomeContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date_asc");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check for success/canceled params from Stripe checkout
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setSuccessMsg("Payment successful! Your ticket has been confirmed.");
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredAndSortedEvents = useMemo(() => {
    let result = events;

    // Text search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q) ||
          (event.description ?? "").toLowerCase().includes(q)
      );
    }

    // Price filter
    if (priceFilter === "free") {
      result = result.filter((event) => event.price === 0);
    } else if (priceFilter === "paid") {
      result = result.filter((event) => event.price > 0);
    }

    // Sort
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    }
    // date_asc is the default from the DB query, no re-sort needed

    return result;
  }, [events, searchQuery, priceFilter, sortBy]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* ── Hero Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Success message from checkout */}
          {successMsg && (
            <div className="mb-6">
              <Alert type="success" message={successMsg} />
            </div>
          )}

          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Discover &amp; Publish Events
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Discover Extraordinary{" "}
            <span className="text-orange-500">Live Events</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-400 leading-8">
            Browse through live concerts, coding conferences, food festivals,
            and arts. Host your own gathering in minutes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#browse-events"
              className="w-full sm:w-auto rounded-lg bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-[0.98] min-h-[44px] flex items-center justify-center"
            >
              Browse Events
            </a>
            <Link
              href="/create"
              className="w-full sm:w-auto rounded-lg border border-neutral-800 bg-neutral-900/60 px-6 py-3.5 text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white min-h-[44px] flex items-center justify-center"
            >
              Publish an Event
            </Link>
          </div>
        </div>
      </section>

      {/* ── Browse Section ── */}
      <section
        id="browse-events"
        className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20"
        aria-label="Browse events"
      >
        {/* Section header */}
        <div className="border-b border-neutral-800 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Upcoming Events
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Showing the latest available events
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <label htmlFor="search-events" className="sr-only">
                Search events
              </label>
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="search-events"
                type="text"
                placeholder="Search title, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 py-2.5 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all focus:border-orange-500 focus:bg-neutral-900/80 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Filters:</span>
            </div>

            {/* Price filter */}
            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900/40 overflow-hidden" role="group" aria-label="Filter by price">
              {(["all", "free", "paid"] as PriceFilter[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setPriceFilter(option)}
                  aria-pressed={priceFilter === option}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors min-h-[32px] ${
                    priceFilter === option
                      ? "bg-orange-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                  }`}
                >
                  {option === "all" ? "All" : option === "free" ? "Free" : "Paid"}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div>
              <label htmlFor="sort-events" className="sr-only">
                Sort events
              </label>
              <select
                id="sort-events"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs text-neutral-300 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
              >
                <option value="date_asc">Date: Upcoming</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Loading State: Skeleton Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading events">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-neutral-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-neutral-800 rounded" />
                  <div className="h-5 w-3/4 bg-neutral-800 rounded" />
                  <div className="h-3 w-full bg-neutral-800 rounded" />
                  <div className="h-3 w-2/3 bg-neutral-800 rounded" />
                  <div className="pt-4 border-t border-neutral-800 flex justify-between">
                    <div className="h-3 w-28 bg-neutral-800 rounded" />
                    <div className="h-3 w-20 bg-neutral-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          /* ── Events Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5"
              >
                {/* Cover Image */}
                <div className="relative w-full h-48 overflow-hidden bg-neutral-900">
                  {event.image_url ? (
                    <>
                      <Image
                        src={event.image_url}
                        alt={`Cover image for ${event.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
                    </>
                  ) : (
                    /* Fallback when no image */
                    <div className="flex items-center justify-center w-full h-full bg-neutral-900">
                      <Calendar className="h-12 w-12 text-neutral-700" aria-hidden="true" />
                    </div>
                  )}

                  {/* Price badge */}
                  <div className="absolute top-3 right-3 rounded-lg bg-neutral-950/85 border border-neutral-800 px-3 py-1.5 text-xs font-bold text-orange-400 backdrop-blur-sm">
                    {formatPrice(event.price)}
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="mt-2 text-sm text-neutral-400 line-clamp-2 leading-relaxed flex-1">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
                      <time dateTime={event.date}>{formatEventDate(event.date)}</time>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                    View Details
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-neutral-800 border-dashed bg-neutral-900/10 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-6">
              <Calendar className="h-8 w-8" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-white">
              No upcoming events found
            </h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-sm">
              {searchQuery || priceFilter !== "all"
                ? "No events match your current filters. Try adjusting your search or filters."
                : "Be the first to host one! Create an event and share it with the world."}
            </p>
            {!searchQuery && priceFilter === "all" && (
              <Link
                href="/create"
                className="mt-6 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-700 active:scale-95"
              >
                Create an Event
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
