"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { formatEventDateLong } from "@/utils/format";
import Alert from "@/components/Alert";
import Spinner from "@/components/Spinner";
import type { Event } from "@/types/event";
import { Calendar, MapPin, ArrowLeft, Ticket, CheckCircle } from "lucide-react";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check for success/canceled params from Stripe checkout
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      setSuccessMsg("Payment successful! Your ticket has been confirmed.");
      window.history.replaceState({}, "", `/events/${id}`);
    } else if (canceled === "true") {
      setErrorMsg("Payment was canceled. You can try again anytime.");
      window.history.replaceState({}, "", `/events/${id}`);
    }
  }, [searchParams, id]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        setEvent(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Event not found.";
        console.error("Error fetching event:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleFreeRegistration = async () => {
    setErrorMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Please sign in to register for this event.");
      return;
    }

    // Insert a ticket record for free events
    try {
      const { error: insertError } = await supabase.from("tickets").insert({
        event_id: id,
        user_id: user.id,
        amount_paid: 0,
        status: "confirmed",
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique constraint violation — already registered
          setRegistrationSuccess(true);
          setSuccessMsg("You're already registered for this event!");
        } else {
          throw insertError;
        }
      } else {
        setRegistrationSuccess(true);
        setSuccessMsg("You're registered! See you at the event.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      console.error("Registration error:", err);
      setErrorMsg(message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-sm font-medium text-neutral-400">
            Loading event...
          </span>
        </div>
      </div>
    );
  }

  // Error / Not found state
  if (error || !event) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-6">
            <Calendar className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-neutral-400 mb-6 max-w-sm">
            {error ||
              "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-700 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* Hero Image */}
      <div className="relative w-full h-72 sm:h-96 overflow-hidden">
        {event.image_url ? (
          <>
            <Image
              src={event.image_url}
              alt={`Cover image for ${event.title}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-neutral-900">
            <Calendar className="h-20 w-20 text-neutral-800" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          </div>
        )}

        {/* Back button overlay */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-neutral-950/70 border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 backdrop-blur-sm transition-all hover:bg-neutral-900 hover:text-white min-h-[36px]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All Events
          </Link>
        </div>
      </div>

      {/* Event Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 -mt-20 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Alerts */}
          {successMsg && (
            <div className="mb-6">
              <Alert type="success" message={successMsg} />
            </div>
          )}
          {errorMsg && (
            <div className="mb-6">
              <Alert type="error" message={errorMsg} />
            </div>
          )}

          {/* Badge + Price */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
              Live Event
            </span>
            <span className="rounded-lg bg-neutral-950/85 border border-neutral-800 px-4 py-2 text-sm font-bold text-orange-400">
              {event.price === 0 ? "FREE" : `$${event.price.toFixed(2)}`}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {event.title}
          </h1>

          {/* Meta Info */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <Calendar className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Date &amp; Time
                </p>
                <p className="mt-0.5 text-sm font-medium text-neutral-200">
                  <time dateTime={event.date}>{formatEventDateLong(event.date)}</time>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Venue
                </p>
                <p className="mt-0.5 text-sm font-medium text-neutral-200">
                  {event.location}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-200 border-b border-neutral-800 pb-2 mb-4">
                About This Event
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center gap-4">
            {registrationSuccess ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-8 py-3.5 text-sm font-semibold text-emerald-400">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Registered!
              </div>
            ) : (
              <button
                onClick={async () => {
                  if (event.price === 0) {
                    await handleFreeRegistration();
                    return;
                  }
                  setCheckoutLoading(true);
                  setErrorMsg(null);
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ eventId: event.id }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      setErrorMsg(data.error || "Checkout failed. Please try again.");
                    }
                  } catch (err) {
                    console.error("Checkout error:", err);
                    setErrorMsg("An error occurred. Please try again.");
                  } finally {
                    setCheckoutLoading(false);
                  }
                }}
                disabled={checkoutLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
              >
                {checkoutLoading ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" aria-hidden="true" />
                    {event.price === 0
                      ? "Register for Free"
                      : `Buy Ticket — $${event.price.toFixed(2)}`}
                  </>
                )}
              </button>
            )}
            <Link
              href="/"
              className="w-full sm:w-auto text-center rounded-lg border border-neutral-800 bg-neutral-900/60 px-6 py-3.5 text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white min-h-[44px] flex items-center justify-center"
            >
              Browse More Events
            </Link>
          </div>

          {/* Posted info */}
          {event.created_at && (
            <p className="mt-6 text-[10px] text-neutral-600 uppercase tracking-wider">
              Posted on{" "}
              <time dateTime={event.created_at}>
                {new Date(event.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
