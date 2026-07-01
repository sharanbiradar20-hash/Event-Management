"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { supabase } from "@/utils/supabase";
import Alert from "@/components/Alert";
import Spinner from "@/components/Spinner";
import Image from "next/image";
import type { Event } from "@/types/event";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login?redirect=/events/" + id + "/edit");
          return;
        }
        setUserId(user.id);
      } catch (err) {
        console.error("Error verifying authentication:", err);
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router, id]);

  // Fetch event data
  useEffect(() => {
    if (!userId) return;

    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        const event = data as Event;

        // Check ownership
        if (event.organizer_id !== userId) {
          setErrorMsg("You don't have permission to edit this event.");
          setEventLoading(false);
          return;
        }

        // Populate form
        setTitle(event.title);
        setDescription(event.description || "");
        // Convert to datetime-local format
        if (event.date) {
          const d = new Date(event.date);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setDate(local);
        }
        setLocation(event.location);
        setPrice(event.price > 0 ? event.price.toString() : "");
        setImageUrl(event.image_url || "");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load event.";
        console.error("Error fetching event:", err);
        setErrorMsg(message);
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvent();
  }, [userId, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side date validation
    if (date && new Date(date) < new Date()) {
      setErrorMsg("Event date must be in the future.");
      return;
    }

    // Re-fetch the current user ID at submission time
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("You must be logged in to edit an event.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          date,
          location: location.trim(),
          price: price ? parseFloat(price) : 0,
          image_url: imageUrl.trim() || null,
        })
        .eq("id", id)
        .eq("organizer_id", user.id);

      if (error) throw error;

      setSuccessMsg("Event updated successfully!");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update event. Please try again.";
      console.error("Update error:", err);
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Auth loading state
  if (authLoading || eventLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-sm font-medium text-neutral-400">
            {authLoading ? "Verifying session..." : "Loading event..."}
          </span>
        </div>
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="relative flex-1 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-orange-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Edit Event
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Update the details of your event below.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Error message */}
            {errorMsg && <Alert type="error" message={errorMsg} />}

            {/* Success message */}
            {successMsg && <Alert type="success" message={successMsg} />}

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
              >
                Event Title <span className="text-orange-500" aria-hidden="true">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Music Festival"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={5000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell attendees about the event..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
              />
              <p className="mt-1 text-xs text-neutral-600 text-right">
                {description.length}/5000
              </p>
            </div>

            {/* Date & Time + Price */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
                >
                  Date &amp; Time <span className="text-orange-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
                >
                  Price (USD)
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00 (Free)"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                <p className="mt-1 text-xs text-neutral-600">
                  Leave empty or 0 for free events
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
              >
                Location <span className="text-orange-500" aria-hidden="true">*</span>
              </label>
              <input
                id="location"
                type="text"
                required
                maxLength={500}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Madison Square Garden, NY or Online"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="image_url"
                className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2"
              >
                Image URL
              </label>
              <input
                id="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              {imageUrl && (
                <div className="mt-3">
                  <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Preview:
                  </span>
                  <div className="relative w-full h-40 rounded-lg border border-neutral-800 overflow-hidden bg-neutral-900">
                    <Image
                      src={imageUrl}
                      alt="Event image preview"
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit buttons */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <Spinner size="md" className="text-white" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 px-6 py-3 text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white min-h-[44px]"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
