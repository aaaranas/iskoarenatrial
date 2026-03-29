import { router } from '../trpc';
import { authRouter } from './auth';
import { matchRouter } from './match';
import { statsRouter } from './stats';   
import { playersRouter } from './players'; 
import { teamsRouter } from './teams'; 

export const appRouter = router({
  match: matchRouter, // Accessible via trpc.match...
  auth: authRouter,
  stats: statsRouter,
  teams: teamsRouter,
  players: playersRouter
});

export type AppRouter = typeof appRouter;
