import { z } from "zod";

const campaignStepSchema = z.object({
  type: z.enum(["message", "delay", "condition"]),
  value: z.string().default(""),
  delaySeconds: z.number().int().nonnegative().default(0),
  order: z.number().int().nonnegative(),
  aiEnabled: z.boolean().default(false),
});

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Campaign name is required").max(120),
    description: z.string().max(500).optional(),
    triggerType: z
      .enum(["comment", "keyword", "direct_message", "story_reply"])
      .default("keyword"),
    triggerKeywords: z
      .array(z.string().trim().lowercase())
      .min(1, "At least one trigger keyword is required")
      .optional(),
    keywords: z.array(z.string().trim().lowercase()).optional(),
    postId: z.string().optional(),
    postUrl: z.string().optional(),
    steps: z.array(campaignStepSchema).default([]),
    status: z.enum(["draft", "active", "paused", "completed", "stopped"]).default("draft"),
    instagramAccount: z.string().min(1, "Instagram account is required"),
    autoReplyMessage: z.string().trim().min(1, "Auto reply message is required"),
  }),
});

export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campaign ID format"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "Campaign name cannot be empty").max(120).optional(),
    description: z.string().max(500).optional(),
    triggerType: z
      .enum(["comment", "keyword", "direct_message", "story_reply"])
      .optional(),
    triggerKeywords: z.array(z.string().trim().lowercase()).min(1).optional(),
    keywords: z.array(z.string().trim().lowercase()).optional(),
    postId: z.string().optional(),
    postUrl: z.string().optional(),
    steps: z.array(campaignStepSchema).optional(),
    status: z.enum(["draft", "active", "paused", "completed", "stopped"]).optional(),
    instagramAccount: z.string().min(1).optional(),
    autoReplyMessage: z.string().trim().min(1).optional(),
  }),
});

export const getCampaignByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campaign ID format"),
  }),
});
