import { z } from "zod";

const campaignStepSchema = z.object({
  type: z.enum(["message", "delay", "condition"]),
  value: z.string().max(1000).default(""),
  delaySeconds: z.number().int().nonnegative().max(86400).default(0),
  order: z.number().int().nonnegative().max(100),
  aiEnabled: z.boolean().default(false),
}).strict();

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Campaign name is required").max(120),
    description: z.string().max(500).optional(),
    triggerType: z
      .enum(["comment", "keyword", "direct_message", "story_reply"])
      .default("keyword"),
    triggerKeywords: z
      .array(z.string().trim().max(50))
      .max(20)
      .optional(),
    keywords: z.array(z.string().trim().max(50)).max(20).optional(),
    postId: z.string().max(100).nullable().optional(),
    postUrl: z.string().url("Must be a valid URL").max(2000).nullable().optional(),
    steps: z.array(campaignStepSchema).max(50).default([]),
    status: z.enum(["draft", "active", "paused", "completed", "stopped"]).default("draft"),
    instagramAccount: z.string().min(1, "Instagram account is required").max(100),
    autoReplyMessage: z.string().trim().max(1000).optional(),
  }).strict(),
});

export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campaign ID format"),
  }).strict(),
  body: z.object({
    name: z.string().trim().min(1, "Campaign name cannot be empty").max(120).optional(),
    description: z.string().max(500).optional(),
    triggerType: z
      .enum(["comment", "keyword", "direct_message", "story_reply"])
      .optional(),
    triggerKeywords: z.array(z.string().trim().max(50)).max(20).optional(),
    keywords: z.array(z.string().trim().max(50)).max(20).optional(),
    postId: z.string().max(100).nullable().optional(),
    postUrl: z.string().url("Must be a valid URL").max(2000).nullable().optional(),
    steps: z.array(campaignStepSchema).max(50).optional(),
    status: z.enum(["draft", "active", "paused", "completed", "stopped"]).optional(),
    instagramAccount: z.string().min(1).max(100).optional(),
    autoReplyMessage: z.string().trim().max(1000).optional(),
  }).strict(),
});

export const getCampaignByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campaign ID format"),
  }).strict(),
});
