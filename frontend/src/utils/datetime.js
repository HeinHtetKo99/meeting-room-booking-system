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
