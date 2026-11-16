import React, { useEffect, useState } from 'react';
import {
  GUEST_PREFIXES,
  INVITATION,
  buildInvitationLink,
  buildInvitationMessage,
  formatGuestDisplayName,
  type GuestPrefix,
} from './invitation';

interface Generated {
  displayName: string;
  link: string;
  message: string;
}

export default function Admin() {
  const [prefix, setPrefix] = useState<GuestPrefix>('Mr.');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // A generated link is only valid for the inputs it was made from.
  useEffect(() => {
    setGenerated(null);
  }, [prefix, guestName]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = formatGuestDisplayName(prefix, guestName);
    if (!displayName) return;
    const link = buildInvitationLink(window.location.origin, displayName);
    setGenerated({ displayName, link, message: buildInvitationMessage(displayName, link) });
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setToast(label);
  };

  const preview = formatGuestDisplayName(prefix, guestName);
  const { brideEn, groomEn } = INVITATION.couple;

  return (
    <div className="h-[100dvh] overflow-y-auto bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Invitation Links</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">{brideEn} &amp; {groomEn}</h1>
        </div>

        <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label htmlFor="prefix" className="text-sm font-semibold text-slate-600">Select Prefix</label>
              <select
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as GuestPrefix)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {GUEST_PREFIXES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="guest" className="text-sm font-semibold text-slate-600">Guest Name</label>
              <input
                id="guest"
                type="text"
                placeholder="e.g. Sanjaya"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Greeting preview:{' '}
            <span className="font-semibold text-slate-800">{preview ? `Dear ${preview} ❤️` : '—'}</span>
          </p>

          <button
            type="submit"
            disabled={!preview}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Generate Link
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && copy(generated.link, 'Link copied!')}
              className="py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy Link Only
            </button>
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && copy(generated.message, 'Message copied!')}
              className="py-3 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy Full Message
            </button>
          </div>
        </form>

        {generated && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Generated Link</p>
              <a href={generated.link} target="_blank" rel="noreferrer" className="block break-all rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-emerald-700 hover:underline">
                {generated.link}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Message Preview</p>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800 font-sans">
                {generated.message}
              </pre>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
