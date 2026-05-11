import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";

// tRPC route handler — context is empty for now.
// When session-aware procedures are needed server-side, wire the
// cookie-aware Supabase client through context here instead of
// instantiating it inside each procedure.
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
