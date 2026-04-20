import { router } from '../trpc';
import { authRouter }      from './auth';
import { matchRouter }     from './match';
import { statsRouter }     from './stats';
import { playersRouter }   from './players';
import { teamsRouter }     from './teams';
import { sportRouter }     from './sport';
import { mediaRouter }     from './media';
import { highlightRouter } from './highlights';
import { storyRouter }     from './story';

export const appRouter = router({
  match:     matchRouter,
  auth:      authRouter,
  stats:     statsRouter,
  teams:     teamsRouter,
  players:   playersRouter,
  sport:     sportRouter,
  media:     mediaRouter,
  highlight: highlightRouter,
  story:     storyRouter,
});

export type AppRouter = typeof appRouter;