function parseISODate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function toUTCISO(date) {
  return date.toISOString();
}

module.exports = { parseISODate, toUTCISO };
