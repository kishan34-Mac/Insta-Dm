import { z } from "zod";

export const getLeadsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    sort: z.string().optional(),
    search: z.string().max(100).optional(),
    status: z.enum(["new", "contacted", "replied", "won", "lost"]).optional(),
  }).passthrough(), // Allow custom filters dynamically
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID format"),
  }),
  body: z.object({
    status: z.enum(["new", "contacted", "replied", "won", "lost"]).optional(),
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string().trim().max(50)).optional(),
  }),
});
