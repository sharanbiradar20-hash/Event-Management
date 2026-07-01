"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { formatEventDate, formatPrice } from "@/utils/format";
import Spinner from "@/components/Spinner";
import type { Event } from "@/types/event";
import { Calendar, MapPin, Pencil, Trash2, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/dashboard");
        return;
      }
      setUserId(user.id);
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  // Fetch user's events
  useEffect(() => {
    if (!userId) return;
    const fetchMyEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching user events:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchMyEvents();
  }, [userId]);

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    setDeletingId(eventId);
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-sm font-medium text-neutral-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Events
              </h1>
              <p className="text-sm text-neutral-400">
                Manage and track your published events
              </p>
            </div>
          </div>
          <Link
            href="/create"
            className="w-full sm:w-auto text-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-[0.98] min-h-[44px] flex items-center justify-center"
          >
            + Create New Event
          </Link>
        </div>

        {/* Events */}
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden animate-pulse">
                <div className="w-full h-44 bg-neutral-800" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-neutral-800 rounded" />
                  <div className="h-3 w-full bg-neutral-800 rounded" />
                  <div className="h-3 w-2/3 bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden transition-all duration-300 hover:border-orange-500/30"
              >
                {/* Cover Image */}
                <Link href={`/events/${event.id}`} className="relative w-full h-44 overflow-hidden bg-neutral-900 block">
                  {event.image_url ? (
                    <>
                      <Image
                        src={event.image_url}
                        alt={`Cover image for ${event.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-neutral-900">
                      <Calendar className="h-12 w-12 text-neutral-700" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 rounded-lg bg-neutral-950/85 border border-neutral-800 px-3 py-1.5 text-xs font-bold text-orange-400 backdrop-blur-sm">
                    {formatPrice(event.price)}
                  </div>
                </Link>

                {/* Card Body */}
                <div className="flex flex-col flex-1 p-5">
                  <Link href={`/events/${event.id}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                  </Link>

                  {event.description && (
                    <p className="mt-2 text-sm text-neutral-400 line-clamp-2 leading-relaxed flex-1">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
                      <time dateTime={event.date}>{formatEventDate(event.date)}</time>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-2">
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-orange-500/50 hover:text-orange-400 min-h-[32px]"
                    >
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50 min-h-[32px]"
                    >
                      {deletingId === event.id ? (
                        <Spinner size="sm" className="text-neutral-300" />
                      ) : (
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-neutral-800 border-dashed bg-neutral-900/10 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-6">
              <Calendar className="h-8 w-8" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-white">No events yet</h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-sm">
              You haven&apos;t published any events. Create your first event and start sharing it with the world.
            </p>
            <Link
              href="/create"
              className="mt-6 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-700 active:scale-95"
            >
              Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
