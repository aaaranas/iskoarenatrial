import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

// This is the "trpc" member your UI is looking for!
export const trpc = createTRPCReact<AppRouter>();
