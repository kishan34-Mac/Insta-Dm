export function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-11 rounded-lg border border-border bg-background hover:bg-secondary transition-colors flex items-center justify-center gap-3 text-sm font-medium"
    >
      <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.6 7 29 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 43c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.4-4.3 2.4-6.9 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 38.7 16.2 43 24 43z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6 4.9C40.9 35.7 43.5 30.3 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
      </svg>
      Continue with Google
    </button>
  );
}
