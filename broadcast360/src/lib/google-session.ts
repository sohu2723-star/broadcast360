type GoogleIdentityWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        disableAutoSelect?: () => void;
      };
    };
  };
};

/**
 * Clear Broadcast360's Google Identity Services auto-select hint after app logout.
 * This does not sign the user out of Google or delete Google account cookies.
 */
export function clearGoogleAutoSelect(): void {
  if (typeof window === "undefined") return;

  try {
    (window as GoogleIdentityWindow).google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    // Google Identity Services may be unavailable during a fast navigation.
  }

  document.cookie = "g_state=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

export default clearGoogleAutoSelect;
