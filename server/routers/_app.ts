import { router } from '../trpc';
import { authRouter } from './auth';
import { matchRouter } from './match';

export const appRouter = router({
  match: matchRouter, // Accessible via trpc.match...
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
