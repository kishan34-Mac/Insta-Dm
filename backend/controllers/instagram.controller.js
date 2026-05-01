import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env.js";
import User from "../models/User.js";
import { encrypt } from "../utils/encryption.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Instagram OAuth Controller
 * Handles Instagram (Meta) OAuth flow for connecting accounts
 */

//

// @desc    Redirect to Instagram OAuth
// @route   GET /auth/instagram/connect
export const connectInstagram = async (req, res, next) => {
  try {
    const clientId = env.instagramClientId;
    const redirectUri = env.instagramRedirectUri;

    if (!clientId || !redirectUri) {
      throw new AppError("Instagram OAuth not configured", 500);
    }

    // Generate state for CSRF protection
    const state = uuidv4();

    // Store state in session/cookie for validation (use signed cookie)
    res.cookie("ig_oauth_state", state, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Build authorization URL
    const scope = [
      "instagram_basic",
      "instagram_manage_comments",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_read_engagement",
    ].join(",");

    const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);

    res.redirect(authUrl.toString());
  } catch (err) {
    next(err);
  }
};

// @desc    Handle Instagram OAuth callback
// @route   GET /auth/instagram/callback
export const instagramCallback = async (req, res, next) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error("Instagram OAuth Error:", error, error_description);
      throw new AppError(error_description || "OAuth failed", 400);
    }

    // Validate required params
    if (!code || !state) {
      throw new AppError("Missing required parameters", 400);
    }

    // Validate state (CSRF protection)
    const storedState = req.cookies?.ig_oauth_state;
    if (!storedState || storedState !== state) {
      throw new AppError("Invalid state parameter", 400);
    }

    // Clear state cookie
    res.clearCookie("ig_oauth_state");

    // Get user ID from URL or session (passed via state or should be logged in)
    // In a complete flow, the user should be logged in before connecting
    // Or we can store userId in the state parameter
    const userId = req.query.userId || req.query.state;
    if (!userId || userId.length < 24) {
      throw new AppError("User not authenticated", 401);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Step 1: Exchange code for short-lived token
    const tokenResponse = await exchangeCodeForToken(code);

    // Step 2: Exchange for long-lived token
    const longLivedToken = await exchangeForLongLivedToken(
      tokenResponse.access_token,
    );

    // Step 3: Fetch Instagram user info
    const igUserInfo = await getInstagramUserInfo(longLivedToken);

    // Step 4: Encrypt access token
    const encryptedToken = encrypt(longLivedToken);

    // Calculate token expiry (60 days from now)
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    // Step 5: Save Instagram account to user
    const instagramAccount = {
      igUserId: igUserInfo.id,
      igUsername: igUserInfo.username,
      pageId: igUserInfo.page_id,
      accessToken: encryptedToken,
      tokenExpiry: tokenExpiry,
      connectedAt: new Date(),
      isActive: true,
    };

    // Add or update Instagram account
    const existingIndex = user.instagramAccounts.findIndex(
      (acc) => acc.igUserId === igUserInfo.id,
    );

    if (existingIndex >= 0) {
      user.instagramAccounts[existingIndex] = instagramAccount;
    } else {
      user.instagramAccounts.push(instagramAccount);
    }

    await user.save();

    // Redirect to frontend success page
    res.redirect(`${env.frontendUrl}/dashboard/settings?connected=true`);
  } catch (err) {
    console.error("Instagram OAuth Callback Error:", err.message);
    // Redirect to frontend error page
    res.redirect(
      `${env.frontendUrl}/dashboard/settings?error=${encodeURIComponent(err.message)}`,
    );
  }
};

// Helper: Exchange code for short-lived access token
const exchangeCodeForToken = async (code) => {
  try {
    const clientId = env.instagramClientId;
    const clientSecret = env.instagramClientSecret;
    const redirectUri = env.instagramRedirectUri;

    const response = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_code",
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_code: code,
          redirect_uri: redirectUri,
        },
      },
    );

    return response.data;
  } catch (err) {
    console.error("Token Exchange Error:", err.response?.data || err.message);
    throw new AppError("Failed to exchange code for token", 500);
  }
};

// Helper: Exchange short-lived token for long-lived token
const exchangeForLongLivedToken = async (shortLivedToken) => {
  try {
    const clientId = env.instagramClientId;
    const clientSecret = env.instagramClientSecret;

    const response = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_code",
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_code: shortLivedToken,
        },
      },
    );

    // If this returns a new token, use it; otherwise use the original
    return response.data.access_token || shortLivedToken;
  } catch (err) {
    // If exchange fails, return the original token
    console.warn("Long-lived token exchange failed, using short-lived token");
    return shortLivedToken;
  }
};

//  Get Instagram user info from Graph API
const getInstagramUserInfo = async (accessToken) => {
  try {
    // 1. Get user pages
    const pagesResponse = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      },
    );

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      throw new AppError("No Facebook pages found", 400);
    }

    // Get first page
    const page = pagesResponse.data.data[0];
    const pageId = page.id;

    // 2. Get Instagram business account
    const igResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: accessToken,
        },
      },
    );

    if (!igResponse.data.instagram_business_account) {
      throw new AppError("No Instagram business account found", 400);
    }

    const igBusinessAccount = igResponse.data.instagram_business_account;

    // 3. Get Instagram username
    const igUserResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${igBusinessAccount.id}`,
      {
        params: {
          fields: "username,name,profile_picture_url",
          access_token: accessToken,
        },
      },
    );

    return {
      id: igBusinessAccount.id,
      username: igUserResponse.data.username,
      name: igUserResponse.data.name,
      profilePicture: igUserResponse.data.profile_picture_url,
      pageId: pageId,
    };
  } catch (err) {
    console.error("Get IG User Info Error:", err.response?.data || err.message);
    throw new AppError("Failed to fetch Instagram user info", 500);
  }
};

// @desc    Disconnect Instagram account
// @route   POST /auth/instagram/disconnect
export const disconnectInstagram = async (req, res, next) => {
  try {
    const { igUserId } = req.body;

    if (!igUserId) {
      throw new AppError("Instagram user ID is required", 400);
    }

    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove Instagram account
    user.instagramAccounts = user.instagramAccounts.filter(
      (acc) => acc.igUserId !== igUserId,
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Instagram account disconnected",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get connected Instagram accounts
// @route   GET /auth/instagram/accounts
export const getInstagramAccounts = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Transform accounts to hide sensitive data
    const accounts = user.instagramAccounts.map((acc) => ({
      igUserId: acc.igUserId,
      igUsername: acc.igUsername,
      connectedAt: acc.connectedAt,
      isActive: acc.isActive,
      tokenExpiry: acc.tokenExpiry,
    }));

    res.status(200).json({
      success: true,
      data: {
        accounts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  connectInstagram,
  instagramCallback,
  disconnectInstagram,
  getInstagramAccounts,
};
