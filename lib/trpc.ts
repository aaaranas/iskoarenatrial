// Client-side tRPC hook factory.
// Import `trpc` from here — not from `utils/trpc` (that file is deleted).
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

export const trpc = createTRPCReact<AppRouter>();
