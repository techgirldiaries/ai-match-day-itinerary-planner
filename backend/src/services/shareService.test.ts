/**
 * Unit Tests - Share Service
 */

import { describe, it, expect, beforeEach } from "vitest";
import { shareExists } from "~/db/index.ts";
import {
  createShareLink,
  fetchShare,
  deleteShareLink,
  generateQrCodeUrl,
} from "~/services/shareService.ts";
import { v4 as uuidv4 } from "uuid";

const mockItinerary = {
  id: "match-123",
  match: {
    team1: "Liverpool",
    team2: "Manchester United",
    kickoff_time: "14:00",
    stadium: "Anfield",
  },
  transport: {
    trains: [
      {
        id: "train-1",
        operator: "Avanti",
        departure_time: "12:00",
        arrival_time: "14:30",
        price_gbp: 45,
        status: "available",
      },
    ],
  },
};

describe("Share Service", () => {
  describe("createShareLink", () => {
    it("should create a new share link", async () => {
      const response = await createShareLink({
        itinerary: mockItinerary,
        group_size: 4,
      });

      expect(response.success).toBe(true);
      expect(response.share.share_id).toBeDefined();
      expect(response.share.share_id).toMatch(/^[a-z0-9]{8,12}$/i);
      expect(response.share.share_url).toContain("/j/");
    });

    it("should reject invalid itinerary", async () => {
      try {
        await createShareLink({
          itinerary: null as any,
          group_size: 4,
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).toContain("Invalid itinerary");
      }
    });

    it("should set correct expiry time", async () => {
      const response = await createShareLink({
        itinerary: mockItinerary,
        expires_in_hours: 24,
      });

      const expiresAt = new Date(response.share.expires_at);
      const now = new Date();
      const diffHours =
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(diffHours).toBeGreaterThan(23.9);
      expect(diffHours).toBeLessThan(24.1);
    });
  });

  describe("fetchShare", () => {
    let shareId: string;

    beforeEach(async () => {
      const response = await createShareLink({
        itinerary: mockItinerary,
      });
      shareId = response.share.share_id;
    });

    it("should fetch an existing share", () => {
      const response = fetchShare(shareId);

      expect(response.success).toBe(true);
      expect(response.share).toBeDefined();
      expect(response.share!.share_id).toBe(shareId);
    });

    it("should return 404 for non-existent share", () => {
      const response = fetchShare("invalid123");

      expect(response.success).toBe(false);
      expect(response.error).toBe("share_not_found");
    });

    it("should increment view count on fetch", () => {
      const before = fetchShare(shareId);
      const initialCount = before.share!.view_count;

      fetchShare(shareId);
      const after = fetchShare(shareId);

      expect(after.share!.view_count).toBeGreaterThan(initialCount);
    });
  });

  describe("deleteShareLink", () => {
    let shareId: string;
    const userId = uuidv4();

    beforeEach(async () => {
      const response = await createShareLink(
        { itinerary: mockItinerary },
        userId,
      );
      shareId = response.share.share_id;
    });

    it("should delete a share owned by user", () => {
      const result = deleteShareLink(shareId, userId);

      expect(result.success).toBe(true);
      expect(shareExists(shareId)).toBe(false);
    });

    it("should prevent deletion by non-owner", () => {
      const result = deleteShareLink(shareId, "different-user-id");

      expect(result.success).toBe(false);
      expect(result.message).toContain("creator");
    });
  });

  describe("generateQrCodeUrl", () => {
    it("should generate valid QR code URL", async () => {
      const response = await createShareLink({
        itinerary: mockItinerary,
      });

      const qrUrl = generateQrCodeUrl(response.share.share_id);

      expect(qrUrl).toContain("qrserver.com");
      expect(qrUrl).toContain(response.share.share_id);
    });
  });
});
