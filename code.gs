/**
 * Google Apps Script Web App — Wedding RSVP (Resenu & Shashika)
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1RjTUzR50J1HSx5xorjQOqpYxYGXPNHiTUyrJ9EuTOG0/edit
 *
 * The "rsvp" sheet is created automatically on the first RSVP.
 */

const SPREADSHEET_ID = "1RjTUzR50J1HSx5xorjQOqpYxYGXPNHiTUyrJ9EuTOG0";
const RSVP_SHEET_NAME = "rsvp";
const TIMEZONE = "Asia/Colombo";
const RSVP_HEADERS = ["Timestamp", "Name", "Invited As", "Attendance", "Guests"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // prevents two RSVPs writing to the same row at once
    return jsonResponse_(saveRsvp_(parseParams_(e)));
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : "Unexpected error",
    });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

// Open the web app URL in a browser to confirm the deployment works.
function doGet() {
  return jsonResponse_({ ok: true, message: "RSVP service is running" });
}

function saveRsvp_(params) {
  const name = clean_(params.name, 120);
  const invitedAs = clean_(params.invitedAs, 120);
  const guestsRaw = clean_(params.guests, 3);

  if (!name) return { ok: false, message: "Name is required" };

  const attending = guestsRaw !== "0";
  const guests = attending ? Math.max(1, Math.min(50, parseInt(guestsRaw, 10) || 1)) : 0;

  getSheet_().appendRow([
    Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
    name,
    invitedAs,
    attending ? "Attending" : "Declined",
    guests,
  ]);

  return { ok: true, message: "RSVP saved" };
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(RSVP_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(RSVP_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RSVP_HEADERS);
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight("bold").setBackground("#F5EDDC");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Trims, limits length, and blocks spreadsheet formula injection (values starting with = + - @). */
function clean_(value, maxLength) {
  let text = String(value == null ? "" : value).trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function parseParams_(e) {
  const params = Object.assign({}, (e && e.parameter) || {});
  const contents = e && e.postData && e.postData.contents ? String(e.postData.contents).trim() : "";
  if (!contents) return params;
  if (contents.charAt(0) === "{") return Object.assign(params, JSON.parse(contents));

  contents.split("&").forEach(function (pair) {
    if (!pair) return;
    const parts = pair.split("=");
    const key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
    const value = decodeURIComponent((parts.slice(1).join("=") || "").replace(/\+/g, " "));
    if (key) params[key] = value;
  });
  return params;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
