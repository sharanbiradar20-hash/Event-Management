"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Alert from "@/components/Alert";
import Spinner from "@/components/Spinner";
import Image from "next/image";

export default function CreateEventPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Route protection: check for active user session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login?redirect=/create");
          return;
        }
        setUserId(user.id);
      } catch (err) {
        console.error("Error verifying authentication:", err);
        router.push("/login?redirect=/create");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
      setErrorMsg("You must be logged in to create an event.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("events").insert({
        title: title.trim(),
        description: description.trim() || null,
        date,
        location: location.trim(),
        price: price ? parseFloat(price) : 0,
        image_url: imageUrl.trim() || null,
        organizer_id: user.id,
      });

      if (error) throw error;

      // Success: redirect to homepage to see the new event
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create event. Please try again.";
      console.error("Insert error:", err);
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-sm font-medium text-neutral-400">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  // If no user found, useEffect will redirect — render nothing
  if (!userId) return null;

  return (
    <div className="relative flex-1 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Page header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Publish a New Event
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Fill out the details below to list your event on the platform.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Error message */}
            {errorMsg && <Alert type="error" message={errorMsg} />}

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
                placeholder="Tell attendees about the event, schedule, and special announcements..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
              />
              <p className="mt-1 text-xs text-neutral-600 text-right">
                {description.length}/5000
              </p>
            </div>

            {/* Date & Time + Price — side by side */}
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
                  min={new Date().toISOString().slice(0, 16)}
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

            {/* Submit button */}
            <div className="pt-4 border-t border-neutral-800">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <Spinner size="md" className="text-white" />
                    Publishing...
                  </>
                ) : (
                  "Publish Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
