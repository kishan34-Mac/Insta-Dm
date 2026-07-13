import { z } from "zod";

export const getLeadsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().max(1000).default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sort: z.string().max(100).optional(),
    search: z.string().max(100).optional(),
    status: z.enum(["new", "contacted", "replied", "won", "lost"]).optional(),
  }).strict(), // Strict queries to block prototype injection
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID format"),
  }).strict(),
  body: z.object({
    status: z.enum(["new", "contacted", "replied", "won", "lost"]).optional(),
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
  }).strict(),
});

export const getLeadByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID format"),
  }).strict(),
});
