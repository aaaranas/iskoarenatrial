// Client-side match date/time formatting helpers.
//
// WHY THIS LIVES HERE
//   Previously match.getAll formatted `date` and `time` strings server-side via
//   toLocaleDateString / toLocaleTimeString. Those calls used the server's locale,
//   which on Vercel can drift from the user's locale — producing dates like
//   "5/20/2026" for one viewer and "20/05/2026" for another, served from the same
//   API response. Moving formatting to the client ensures the user's own locale
//   drives the output.
//
// USAGE
//   import { formatMatchDate, formatMatchTime } from "@/lib/format-match-date";
//   {formatMatchDate(match.rawDate)} · {formatMatchTime(match.rawDate)}

const FALLBACK = "TBD";

/** Returns a locale-formatted date string (e.g. "5/20/2026"), or "TBD" when the input is null/invalid. */
export function formatMatchDate(rawDate: string | null | undefined): string {
  if (!rawDate) return FALLBACK;
  const d = new Date(rawDate);
  // Date constructor returns Invalid Date silently — guard against it.
  if (Number.isNaN(d.getTime())) return FALLBACK;
  return d.toLocaleDateString();
}

/** Returns a locale-formatted 2-digit hour:minute string (e.g. "4:30 PM"), or "TBD" when the input is null/invalid. */
export function formatMatchTime(rawDate: string | null | undefined): string {
  if (!rawDate) return FALLBACK;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return FALLBACK;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
