export const INVITATION = {
  couple: {
    bride: "රෙසේනු",
    groom: "ශෂික",
    brideFull: "රෙසේනු",
    groomFull: "ශෂික",
    brideEn: "Resenu",
    groomEn: "Shashika",
  },
  date: {
    displayNumeric: "25 . 01 . 2027",
    displayLong: "2027 ජනවාරි මස 25 වන දින",
    countdownTarget: "2027-01-25T10:00:00+05:30",
  },
  time: {
    ceremonyStart: "පෙ.ව. 10:01",
    ceremonyEnd: "ප.ව. 4:00",
    registration: "පෙ.ව. 10:00",
    welcome: "උදෑසන 8:00",
  },
  venue: {
    name: "Green Court Hotel",
    city: "Homagama",
    mapQuery: "Green Court Hotel, Homagama",
    googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Green+Court+Hotel+Homagama",
  },
  rsvpContacts: [
    "Shashika - 078 179 9321",
    "Resenu - 070 602 3232",
  ],
} as const;

export const GUEST_PREFIXES = ["Mr.", "Mrs.", "Miss", "Mr. & Mrs.", "Family", "Dear"] as const;
export type GuestPrefix = (typeof GUEST_PREFIXES)[number];

/** Combines prefix and name. "Dear" adds nothing here — the message greeting already starts with "Dear". */
export function formatGuestDisplayName(prefix: GuestPrefix, rawName: string): string {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (!name) return "";
  switch (prefix) {
    case "Family":
      return `${name} and Family`;
    case "Dear":
      return name;
    default:
      return `${prefix} ${name}`;
  }
}

export function buildInvitationLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(displayName)}`;
}

export function buildInvitationMessage(displayName: string, link: string): string {
  const { groomEn, brideEn } = INVITATION.couple;
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${groomEn} & ${brideEn}`;
}

/** Reads the guest display name from /{name} (or the older ?to= link format). */
export function readGuestNameFromUrl(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get("to");
  if (fromQuery?.trim()) return fromQuery.trim();
  const segment = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!segment || segment.includes("/") || segment.toLowerCase() === "admin" || segment.toLowerCase() === "index.html") return null;
  try {
    const decoded = decodeURIComponent(segment).trim();
    return decoded || null;
  } catch {
    return null;
  }
}

/**
 * Google Apps Script web app URL that saves RSVPs to the Google Sheet (see code.gs).
 * From Deploy → Manage deployments in Apps Script.
 */
export const RSVP_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwOxebLp0s7PrYOpHLSuMN-XaoI92gJm6CGVlvNTnmuNADQBTwciq4fsuWAIBSHSVhkyA/exec";
