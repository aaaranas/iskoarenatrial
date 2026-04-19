import { router } from '../trpc';
import { authRouter }      from './auth';
import { matchRouter }     from './match';
import { statsRouter }     from './stats';
import { playersRouter }   from './players';
import { teamsRouter }     from './teams';
import { sportRouter }     from './sport';

export const appRouter = router({
  match:     matchRouter,
  auth:      authRouter,
  stats:     statsRouter,
  teams:     teamsRouter,
  players:   playersRouter,
  sport:     sportRouter,
});

export type AppRouter = typeof appRouter;
