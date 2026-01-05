import * as Sentry from "@sentry/vercel-edge";

const dsn = process.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn: dsn,
    tracesSampleRate: 1.0,
  });
}

export const withSentry = (handler: Function) => {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error: any) {
      console.error('Edge Function Error:', error);
      if (dsn) {
        Sentry.captureException(error);
        await Sentry.flush(2000);
      }
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error?.message || String(error),
        stack: error?.stack 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
};
