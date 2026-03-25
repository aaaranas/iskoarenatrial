import { z } from "zod";

export const matchSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  college_a: z.string().min(2, "Select a college"),
  college_b: z.string().min(2, "Select a college"),
  status: z.enum(["upcoming", "live", "concluded"]).default("upcoming"),
  scheduled_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export type MatchInput = z.infer<typeof matchSchema>;
