import { router } from '../trpc';
import { authRouter }      from './auth';
import { matchRouter }     from './match';
import { statsRouter }     from './stats';
import { playersRouter }   from './players';
import { teamsRouter }     from './teams';
import { sportRouter }     from './sport';
import { venueRouter }     from './venue';
import { mediaRouter }     from './media';
import { highlightRouter } from './highlight';
import { profileRouter }   from './profile';

export const appRouter = router({
  match:     matchRouter,
  auth:      authRouter,
  stats:     statsRouter,
  team:      teamsRouter,
  players:   playersRouter,
  sport:     sportRouter,
  venue:     venueRouter,
  media:     mediaRouter,
  highlight: highlightRouter,
  profile:   profileRouter,
});

export type AppRouter = typeof appRouter;
