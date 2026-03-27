/**
 * Share Service - Business Logic for Feature 2: Group Invite Links
 */

import { v4 as uuidv4 } from "uuid";
import {
  createShare,
  getShareById,
  incrementShareViewCount,
  deleteShare,
  getSharesByCreator,
} from "~/db/index.ts";
import {
  CreateShareRequest,
  CreateShareResponse,
  GroupShare,
  FetchShareResponse,
} from "~/types/index.ts";

/**
 * Generate a unique share_id (8-12 character base62 token)
 */
function generateShareId(): string {
  // Generate 48-bit random integer and convert to base62
  const randomBytes = Buffer.alloc(6);
  for (let i = 0; i < 6; i++) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }

  // Convert to base62 (alphanumeric)
  const num = randomBytes.readUIntBE(0, 6);
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let shareId = "";
  let n = num;
  while (n > 0) {
    shareId = alphabet[n % 62] + shareId;
    n = Math.floor(n / 62);
  }

  return shareId.padStart(8, "0").substring(0, 12);
}

/**
 * Calculate SHA256 hash of itinerary (for dedup detection)
 * Returns hex string
 */
function hashItinerary(itinerary: any): string {
  // Simple hash for MVP (not cryptographically secure, just for dedup)
  const jsonStr = JSON.stringify(itinerary);
  let hash = 0;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Extract metadata from itinerary
 */
function extractMetadata(itinerary: any) {
  return {
    match_date: itinerary.match?.date || itinerary.match_date || null,
    match_city: itinerary.match?.city || itinerary.destination || null,
  };
}

/**
 * Create a new shareable link for an itinerary
 */
export async function createShareLink(
  request: CreateShareRequest,
  creatorUserId?: string,
): Promise<CreateShareResponse> {
  const { itinerary, group_size = 4, expires_in_hours = 48 } = request;

  // Validate itinerary
  if (!itinerary || typeof itinerary !== "object") {
    throw new Error("Invalid itinerary object");
  }

  // Generate unique share_id
  const shareId = generateShareId();

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expires_in_hours);

  // Extract metadata
  const { match_date, match_city } = extractMetadata(itinerary);

  // Create share in database
  const share = createShare({
    id: uuidv4(),
    share_id: shareId,
    creator_user_id: creatorUserId,
    itinerary_data: JSON.stringify(itinerary),
    itinerary_hash: hashItinerary(itinerary),
    group_size,
    match_date,
    match_city,
    expires_at: expiresAt.toISOString(),
  });

  const baseUrl = process.env.SHARE_LINK_BASE_URL || "http://localhost:5173";
  const shareUrl = `${baseUrl}/j/${shareId}`;

  return {
    success: true,
    share: {
      share_id: shareId,
      share_url: shareUrl,
      short_url: `ltfc.app/j/${shareId}`,
      created_at: share.created_at,
      expires_at: share.expires_at,
    },
    message: `Share link created. Link expires in ${expires_in_hours} hours.`,
  };
}

/**
 * Fetch a shared itinerary by share_id
 */
export function fetchShare(shareId: string): FetchShareResponse {
  // Validate format
  if (!shareId || !/^[a-z0-9]{8,12}$/i.test(shareId)) {
    return {
      success: false,
      error: "invalid_share_id",
      message: "Invalid share link format",
    };
  }

  // Get share from database
  const share = getShareById(shareId);

  if (!share) {
    return {
      success: false,
      error: "share_not_found",
      message: "This share link does not exist or has been deleted",
    };
  }

  // Check if expired
  if (new Date(share.expires_at) < new Date()) {
    return {
      success: false,
      error: "share_expired",
      message: `This share link expired on ${new Date(share.expires_at).toLocaleDateString()}`,
    };
  }

  // Check if active
  if (!share.is_active) {
    return {
      success: false,
      error: "share_inactive",
      message: "This share has been removed by the creator",
    };
  }

  // Increment view count
  incrementShareViewCount(shareId);

  return {
    success: true,
    share: {
      ...share,
      view_count: share.view_count + 1, // Return updated count
    },
  };
}

/**
 * Get creator's shares
 */
export function getSharesByUserIdService(userId: string): GroupShare[] {
  return getSharesByCreator(userId);
}

/**
 * Delete a share (creator only)
 */
export function deleteShareLink(
  shareId: string,
  userId?: string,
): { success: boolean; message: string } {
  const share = getShareById(shareId);

  if (!share) {
    return { success: false, message: "Share not found" };
  }

  // Verify creator (if userId provided)
  if (userId && share.creator_user_id !== userId) {
    return {
      success: false,
      message: "Only the creator can delete this share",
    };
  }

  const deleted = deleteShare(shareId);

  if (!deleted) {
    return { success: false, message: "Failed to delete share" };
  }

  return { success: true, message: "Share deleted successfully" };
}

/**
 * Generate QR code URL for a share
 * For MVP, returns a placeholder URL
 */
export function generateQrCodeUrl(shareId: string): string {
  const shareUrl = `${process.env.SHARE_LINK_BASE_URL || "http://localhost:5173"}/j/${shareId}`;

  // Using QR Server API (free service)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
}

/**
 * Validate share link before allowing access
 */
export function validateShareAccess(shareId: string): {
  valid: boolean;
  reason?: string;
} {
  const share = getShareById(shareId);

  if (!share) {
    return { valid: false, reason: "Share not found" };
  }

  if (!share.is_active) {
    return { valid: false, reason: "Share has been deactivated" };
  }

  if (new Date(share.expires_at) < new Date()) {
    return { valid: false, reason: "Share has expired" };
  }

  return { valid: true };
}
