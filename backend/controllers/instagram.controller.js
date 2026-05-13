import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import InstagramAccount from "../models/instagramAccount.model.js";
import env from "../config/env.js";
import User from "../models/User.js";
import crypto from "crypto";

import { encrypt } from "../utils/encryption.js";
import { AppError } from "../utils/errorHandler.js";

 
// CONNECT INSTAGRAM
export const connectInstagram = async (req, res) => {
  const scope = [
    "pages_show_list",
    "instagram_basic",
    "instagram_manage_messages",
    "pages_manage_metadata",
  ].join(",");

  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(
      process.env.INSTAGRAM_REDIRECT_URI
    )}` +
    `&scope=${scope}` +
    `&response_type=code`;

  return res.redirect(authUrl);
};
/* =========================
   INSTAGRAM CALLBACK
========================= */
export const instagramCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    // Exchange code for token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch Facebook pages
    const pagesResponse = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    const page = pagesResponse.data.data[0];

    if (!page) {
      return res.status(400).json({
        success: false,
        message: "No Facebook page found",
      });
    }

    // Fetch Instagram business account
    const igResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: page.access_token,
        },
      }
    );

    const igBusinessId =
      igResponse.data.instagram_business_account?.id;

    if (!igBusinessId) {
      return res.status(400).json({
        success: false,
        message: "Instagram business account not connected",
      });
    }

    // Fetch Instagram profile
    const igProfileResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${igBusinessId}`,
      {
        params: {
          fields: "id,username",
          access_token: page.access_token,
        },
      }
    );

    const existingAccount = await InstagramAccount.findOne({
      igUserId: igBusinessId,
    });

    if (!existingAccount) {
      await InstagramAccount.create({
        igUserId: igBusinessId,
        igUsername: igProfileResponse.data.username,
        pageId: page.id,
        accessToken: page.access_token,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Instagram connected successfully",
      account: igProfileResponse.data,
    });
  } catch (error) {
    console.log(
      "Instagram Callback Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to connect Instagram",
    });
  }
};

/* =========================
   EXCHANGE TOKEN
========================= */
const exchangeCodeForToken = async (
  code
) => {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id:
            env.instagramClientId,

          client_secret:
            env.instagramClientSecret,

          redirect_uri:
            env.instagramRedirectUri,

          code,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error(
      "Code Exchange Error:",
      err.response?.data || err.message
    );

    throw new AppError(
      "Failed to exchange OAuth code",
      500
    );
  }
};

/* =========================
   LONG LIVED TOKEN
========================= */
const exchangeForLongLivedToken =
  async (shortLivedToken) => {
    try {
      const response =
        await axios.get(
          "https://graph.facebook.com/v19.0/oauth/access_token",
          {
            params: {
              grant_type:
                "fb_exchange_token",

              client_id:
                env.instagramClientId,

              client_secret:
                env.instagramClientSecret,

              fb_exchange_token:
                shortLivedToken,
            },
          }
        );

      return response.data.access_token;
    } catch (err) {
      console.warn(
        "Long lived token failed:",
        err.response?.data ||
          err.message
      );

      return shortLivedToken;
    }
  };

/* =========================
   GET INSTAGRAM INFO
========================= */
const getInstagramUserInfo =
  async (accessToken) => {
    try {
      const pagesResponse =
        await axios.get(
          "https://graph.facebook.com/v19.0/me/accounts",
          {
            params: {
              access_token:
                accessToken,
            },
          }
        );

      const pages =
        pagesResponse.data.data || [];

      if (!pages.length) {
        throw new AppError(
          "No Facebook Pages found",
          400
        );
      }

      const page = pages[0];

      const igResponse =
        await axios.get(
          `https://graph.facebook.com/v19.0/${page.id}`,
          {
            params: {
              fields:
                "instagram_business_account",

              access_token:
                accessToken,
            },
          }
        );

      if (
        !igResponse.data
          .instagram_business_account
      ) {
        throw new AppError(
          "No Instagram Business account connected to page",
          400
        );
      }

      const igBusiness =
        igResponse.data
          .instagram_business_account;

      const profileResponse =
        await axios.get(
          `https://graph.facebook.com/v19.0/${igBusiness.id}`,
          {
            params: {
              fields:
                "id,username,name,profile_picture_url",

              access_token:
                accessToken,
            },
          }
        );

      return {
        id: igBusiness.id,

        username:
          profileResponse.data
            .username,

        name:
          profileResponse.data.name,

        profilePicture:
          profileResponse.data
            .profile_picture_url,

        pageId: page.id,

        pageName: page.name,

        pageAccessToken:
          page.access_token,
      };
    } catch (err) {
      console.error(
        "Instagram User Fetch Error:",
        err.response?.data ||
          err.message
      );

      throw new AppError(
        "Failed to fetch Instagram profile",
        500
      );
    }
  };

/* =========================
   DISCONNECT
========================= */
export const disconnectInstagram =
  async (req, res, next) => {
    try {
      const { igUserId } = req.body;

      if (!igUserId) {
        throw new AppError(
          "Instagram User ID required",
          400
        );
      }

      const user =
        await User.findOne();

      if (!user) {
        throw new AppError(
          "User not found",
          404
        );
      }

      user.instagramAccounts =
        user.instagramAccounts.filter(
          (acc) =>
            acc.igUserId !==
            igUserId
        );

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Instagram disconnected",
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   GET ACCOUNTS
========================= */
export const getInstagramAccounts =
  async (req, res) => {
    try {
      const user =
        await User.findOne({
          instagramAccounts: {
            $exists: true,
            $ne: [],
          },
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "No Instagram accounts found",
        });
      }

      const accounts =
        user.instagramAccounts.map(
          (acc) => ({
            igUserId:
              acc.igUserId,

            igUsername:
              acc.igUsername,

            pageId: acc.pageId,

            pageName:
              acc.pageName,

            connectedAt:
              acc.connectedAt,

            tokenExpiry:
              acc.tokenExpiry,

            isActive:
              acc.isActive,

            webhookSubscribed:
              acc.webhookSubscribed,
          })
        );

      return res.status(200).json({
        success: true,
        accounts,
      });
    } catch (err) {
      console.error(
        "Get Accounts Error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch Instagram accounts",
      });
    }
  };

export default {
  connectInstagram,
  instagramCallback,
  disconnectInstagram,
  getInstagramAccounts,
};