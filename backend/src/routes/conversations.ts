/**
 * API Routes - Conversation Endpoints for Chat Message Persistence
 * Hybrid storage: localStorage primary, backend as persistent fallback
 */

import { Hono } from "hono";
import { getDb, persistDb } from "~/db/index.ts";

// Message format sent from frontend
interface IncomingMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  agentName?: string;
  syncStatus?: "pending" | "local" | "synced" | "error";
}

// Message format returned from backend
interface DatabaseMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  agentName?: string;
  syncStatus: "synced";
}

const conversationRoutes = new Hono();

/**
 * Ensure user exists in database
 * @param userId - The user ID to ensure exists
 */
function ensureUserExists(userId: string): void {
  const db = getDb();
  const checkStmt = db.prepare(`SELECT id FROM users WHERE id = ?`);
  checkStmt.bind([userId]);

  if (!checkStmt.step()) {
    const insertStmt = db.prepare(
      `INSERT INTO users (id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))`,
    );
    insertStmt.bind([userId]);
    insertStmt.step();
    insertStmt.free();
    persistDb();
  }

  checkStmt.free();
}

/**
 * POST /api/conversations/:userId/messages
 * Save a single message to backend database (hybrid persistence)
 * Frontend saves locally immediately, then calls this to persist to backend
 */
conversationRoutes.post("/api/conversations/:userId/messages", async (c) => {
  try {
    const userId = c.req.param("userId");
    const message = await c.req.json<IncomingMessage>();

    // Validate required fields
    if (!userId) {
      return c.json(
        {
          success: false,
          error: "missing_user_id",
          message: "User ID is required",
        },
        400,
      );
    }

    if (!message.id || message.role === undefined || !message.content) {
      return c.json(
        {
          success: false,
          error: "invalid_message",
          message: "Message must have id, role, and content",
        },
        400,
      );
    }

    // Ensure user exists before inserting message
    ensureUserExists(userId);

    const db = getDb();

    // Insert message into conversations table
    const stmt = db.prepare(`
      INSERT INTO conversations (
        id, user_id, message_id, role, content, agent_name, created_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime(?), datetime('now'))
    `);

    const messageId = `${userId}-${message.id}`;
    stmt.bind([
      messageId,
      userId,
      message.id,
      message.role,
      message.content,
      message.agentName || null,
      new Date(message.timestamp).toISOString(),
    ]);

    stmt.step();
    stmt.free();

    // Persist changes to disk
    persistDb();

    return c.json(
      {
        success: true,
        synced: true,
        messageId: message.id,
        timestamp: Date.now(),
      },
      201,
    );
  } catch (error) {
    console.error("[POST /api/conversations/:userId/messages] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to save message",
      },
      500,
    );
  }
});

/**
 * GET /api/conversations/:userId/messages
 * Retrieve all messages for a user from backend database
 * Used for restoring conversation when localStorage is empty or unavailable
 */
conversationRoutes.get("/api/conversations/:userId/messages", async (c) => {
  try {
    const userId = c.req.param("userId");
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 100;
    const since = c.req.query("since"); // ISO timestamp for incremental sync

    if (!userId) {
      return c.json(
        {
          success: false,
          error: "missing_user_id",
          message: "User ID is required",
        },
        400,
      );
    }

    const db = getDb();

    // Build query with optional time filter
    let query = `
      SELECT id, message_id, role, content, agent_name, created_at, synced_at
      FROM conversations
      WHERE user_id = ?
    `;

    const params: (string | number)[] = [userId];

    if (since) {
      query += ` AND created_at > ?`;
      params.push(since);
    }

    query += ` ORDER BY created_at ASC LIMIT ?`;
    params.push(limit);

    const stmt = db.prepare(query);
    stmt.bind(params);

    const messages: DatabaseMessage[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      messages.push({
        id: row.message_id as string,
        role: row.role as "user" | "agent",
        content: row.content as string,
        timestamp: new Date(row.created_at as string).getTime(),
        agentName: (row.agent_name as string) || undefined,
        syncStatus: "synced",
      });
    }

    stmt.free();

    return c.json(
      {
        success: true,
        messages,
        count: messages.length,
      },
      200,
    );
  } catch (error) {
    console.error("[GET /api/conversations/:userId/messages] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to retrieve messages",
      },
      500,
    );
  }
});

/**
 * DELETE /api/conversations/:userId/messages/:messageId
 * Delete a specific message from backend database
 * Useful for message deletion with sync
 */
conversationRoutes.delete(
  "/api/conversations/:userId/messages/:messageId",
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const messageId = c.req.param("messageId");

      if (!userId || !messageId) {
        return c.json(
          {
            success: false,
            error: "missing_params",
            message: "User ID and Message ID are required",
          },
          400,
        );
      }

      const db = getDb();
      const stmt = db.prepare(
        `DELETE FROM conversations WHERE user_id = ? AND message_id = ?`,
      );
      stmt.bind([userId, messageId]);
      stmt.step();
      stmt.free();

      persistDb();

      return c.json(
        {
          success: true,
          deleted: true,
        },
        200,
      );
    } catch (error) {
      console.error(
        "[DELETE /api/conversations/:userId/messages/:messageId] Error:",
        error,
      );
      return c.json(
        {
          success: false,
          error: "internal_error",
          message: "Failed to delete message",
        },
        500,
      );
    }
  },
);

/**
 * DELETE /api/conversations/:userId
 * Delete all messages for a user (clear conversation)
 */
conversationRoutes.delete("/api/conversations/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    if (!userId) {
      return c.json(
        {
          success: false,
          error: "missing_user_id",
          message: "User ID is required",
        },
        400,
      );
    }

    const db = getDb();
    const stmt = db.prepare(`DELETE FROM conversations WHERE user_id = ?`);
    stmt.bind([userId]);
    stmt.step();
    stmt.free();

    persistDb();

    return c.json(
      {
        success: true,
        cleared: true,
      },
      200,
    );
  } catch (error) {
    console.error("[DELETE /api/conversations/:userId] Error:", error);
    return c.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to clear conversation",
      },
      500,
    );
  }
});

export default conversationRoutes;
