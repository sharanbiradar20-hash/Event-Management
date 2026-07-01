/**
 * Format an event date string into a readable short format.
 * Example: "Mon, Jan 1, 12:00 PM"
 */
export function formatEventDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  } catch {
    return dateString;
  }
}

/**
 * Format an event date string into a readable long format.
 * Example: "Monday, January 1, 2026, 12:00 PM"
 */
export function formatEventDateLong(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  } catch {
    return dateString;
  }
}

/**
 * Format a price number for display.
 * Returns "Free" for 0, otherwise "$X.XX"
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price.toFixed(2)}`;
}
