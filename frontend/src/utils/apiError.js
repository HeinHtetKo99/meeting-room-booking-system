/** Read error text from API responses (Express returns `{ error: string }`). */
export function getApiErrorMessage(reqError) {
  const data = reqError?.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }
  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error.trim();
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  if (reqError?.message === "Network Error") {
    return "Cannot reach the server. Check your connection and API URL.";
  }
  return null;
}
