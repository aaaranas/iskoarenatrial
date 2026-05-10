export const createContext = async ({ req }: { req: Request }) => {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  return { token };
};

export type Context = Awaited<ReturnType<typeof createContext>>;