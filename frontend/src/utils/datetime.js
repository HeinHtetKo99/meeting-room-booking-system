/** Convert datetime-local value (local wall clock) to UTC ISO for the API. */
export function datetimeLocalToUtcIso(localValue) {
  if (!localValue) {
    return "";
  }
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

export function formatBookingTimeRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Invalid time range";
  }

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const startDate = dateFmt.format(start);
  const startTime = timeFmt.format(start);
  const endTime = timeFmt.format(end);

  if (sameDay) {
    return `${startDate}, ${startTime} – ${endTime}`;
  }
  const endDate = dateFmt.format(end);
  return `${startDate}, ${startTime} – ${endDate}, ${endTime}`;
}

export function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function compareByStartTime(a, b) {
  return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
}

/** Matches backend bookingRules past-start check (UTC instant). */
export function isStartTimeInPast(localValue) {
  const iso = datetimeLocalToUtcIso(localValue);
  if (!iso) {
    return false;
  }
  return new Date(iso).getTime() < Date.now();
}

/** Value for datetime-local `min` (local wall clock, minute precision). */
export function toDatetimeLocalInputValue(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return "";
  }
  const pad = (part) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

/** Later of two datetime-local strings (YYYY-MM-DDTHH:mm). */
export function maxDatetimeLocal(a, b) {
  if (!a) {
    return b || "";
  }
  if (!b) {
    return a;
  }
  return a > b ? a : b;
}
