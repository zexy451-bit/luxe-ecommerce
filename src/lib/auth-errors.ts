// Maps raw Supabase auth errors into friendly user-facing messages.
// Anything we don't recognise falls back to the original.

export function friendlyAuthError(err: { message?: string } | null | undefined): string {
  const m = err?.message || "Something went wrong";
  const lower = m.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "That email and password don't match. Double-check, or reset your password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email first — we sent you a link. Check your inbox (and spam).";
  }
  if (lower.includes("user already registered")) {
    return "An account with that email already exists. Sign in instead.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Please wait a moment and try again.";
  }
  if (lower.includes("email rate limit")) {
    return "We're sending too many emails. Try again in a few minutes.";
  }
  if (lower.includes("password should be at least") || lower.includes("password must")) {
    return "Use at least 8 characters for your password.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Connection issue. Check your internet and try again.";
  }
  return m;
}
