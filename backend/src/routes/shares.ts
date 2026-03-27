/**
 * API Routes - Share Endpoints for Feature 2: Group Invite Links
 */

import { Hono } from "hono";
import { CreateShareRequest } from "~/types/index.ts";
import {
  createShareLink,
  fetchShare,
  getSharesByUserIdService,
  deleteShareLink,
  generateQrCodeUrl,
} from "~/services/shareService.ts";

const shareRoutes = new Hono();

/**
 * POST /api/shares
 * Create a new shareable link
 */
shareRoutes.post("/api/shares", async (c) => {
  try {
    const body = await c.req.json<CreateShareRequest>();
    const userId = c.req.header("X-User-ID");

    // Validate request body
    if (!body.itinerary) {
      return c.json(
        {
          success: false,
          error: "missing_itinerary",
          message: "Itinerary is required",
        },
        400,
      );
    }

    // Create share
    const response = await createShareLink(body, userId);

    // Add QR code URL
    return c.json(
      {
        ...response,
        share: {
          ...response.share,
          qr_code_url: generateQrCodeUrl(response.share.share_id),
        },
      },
      201,
    );
  } catch (error) {
    console.error("[POST /api/shares] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to create share link",
      },
      500,
    );
  }
});

/**
 * GET /api/shares/{share_id}
 * Fetch a shared itinerary
 */
shareRoutes.get("/api/shares/:shareId", async (c) => {
  try {
    const shareId = c.req.param("shareId");

    if (!shareId) {
      return c.json(
        {
          success: false,
          error: "missing_share_id",
          message: "Share ID is required",
        },
        400,
      );
    }

    const response = fetchShare(shareId);

    if (!response.success) {
      // Map error to appropriate status code
      let statusCode: number = 404;
      if (response.error === "share_expired") statusCode = 410;
      if (response.error === "share_inactive") statusCode = 403;

      return c.json(response, statusCode as any);
    }

    return c.json(response, 200);
  } catch (error) {
    console.error("[GET /api/shares/:shareId] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to fetch share",
      },
      500,
    );
  }
});

/**
 * GET /api/shares
 * List user's shares (owned by creator)
 */
shareRoutes.get("/api/shares", async (c) => {
  try {
    const userId = c.req.header("X-User-ID");

    if (!userId) {
      return c.json(
        {
          success: false,
          error: "missing_user_id",
          message: "X-User-ID header is required",
        },
        401,
      );
    }

    const shares = getSharesByUserIdService(userId);

    return c.json(
      {
        success: true,
        shares,
        total: shares.length,
      },
      200,
    );
  } catch (error) {
    console.error("[GET /api/shares] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to list shares",
      },
      500,
    );
  }
});

/**
 * DELETE /api/shares/{share_id}
 * Delete a share (creator only)
 */
shareRoutes.delete("/api/shares/:shareId", async (c) => {
  try {
    const shareId = c.req.param("shareId");
    const userId = c.req.header("X-User-ID");

    if (!shareId) {
      return c.json(
        {
          success: false,
          error: "missing_share_id",
          message: "Share ID is required",
        },
        400,
      );
    }

    const result = deleteShareLink(shareId, userId);

    if (!result.success) {
      return c.json(
        { success: false, error: "unauthorized", message: result.message },
        403,
      );
    }

    return c.json(
      {
        success: true,
        message: "Share deleted successfully",
      },
      200,
    );
  } catch (error) {
    console.error("[DELETE /api/shares/:shareId] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to delete share",
      },
      500,
    );
  }
});

/**
 * GET /api/shares/{share_id}/qr
 * Generate QR code for a share
 */
shareRoutes.get("/api/shares/:shareId/qr", async (c) => {
  try {
    const shareId = c.req.param("shareId");

    if (!shareId) {
      return c.json(
        {
          success: false,
          error: "missing_share_id",
          message: "Share ID is required",
        },
        400,
      );
    }

    const qrUrl = generateQrCodeUrl(shareId);

    // Redirect to QR code image
    return c.redirect(qrUrl, 302);
  } catch (error) {
    console.error("[GET /api/shares/:shareId/qr] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to generate QR code",
      },
      500,
    );
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
shareRoutes.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default shareRoutes;
