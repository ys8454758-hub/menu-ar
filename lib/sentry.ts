// lib/sentry.ts - Error tracking setup (optional, stub if no Sentry)

interface SentryEvent {
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export const sentry = {
  // Stub implementation - replace with actual Sentry integration
  init: () => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Initialize Sentry SDK here
      console.log('Sentry initialized');
    }
  },

  captureException: (error: Error, context?: { userId?: string; action?: string }) => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Sentry] Exception:', error.message, context);
      // In production with Sentry:
      // Sentry.captureException(error, { tags: context });
    }
  },

  captureMessage: (message: string, level: SentryEvent['level'] = 'info') => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[Sentry] ${level.toUpperCase()}:`, message);
      // In production with Sentry:
      // Sentry.captureMessage(message, level);
    }
  },

setUser: () => {
    if (process.env.NODE_ENV === 'production') {
        // In production with Sentry:
        // Sentry.setUser(_user);
    }
},

  clearUser: () => {
    // In production with Sentry:
    // Sentry.setUser(null);
  },
};

// Error boundary helper
export function captureError(error: unknown, context: { action: string; userId?: string }) {
  const err = error instanceof Error ? error : new Error(String(error));
  sentry.captureException(err, { userId: context.userId });
  return err;
}
