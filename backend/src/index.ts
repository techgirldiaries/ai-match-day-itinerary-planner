/**
 * Match-Day Itinerary Planner - Backend API Server
 * Feature 2+: Group Invite Links, Real-Time Pricing, Push Notifications, Live Updates
 *
 * Built with Hono.js + SQLite
 */

import "dotenv/config.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { initDb, initializeDatabase } from "~/db/index.ts";
import shareRoutes from "~/routes/shares.ts";

// Initialize database on startup
async function startup() {
	try {
		await initDb();
		initializeDatabase();
		console.log("✅ Database initialized and ready");
	} catch (error) {
		console.error("❌ Failed to initialize database:", error);
		process.exit(1);
	}
}

// Create Hono app
const app = new Hono();

// Middleware
app.use(logger());
app.use(
	cors({
		origin: (origin) => {
			const allowedOrigins = (
				process.env.CORS_ORIGIN || "http://localhost:5173"
			).split(",");
			return allowedOrigins.includes(origin) ? origin : null;
		},
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "X-User-ID", "Authorization"],
	}),
);

/**
 * Root endpoint
 */
app.get("/", (c) => {
	return c.json({
		name: "LTFC Backend API",
		version: "1.0.0",
		status: "operational",
		endpoints: {
			health: "GET /api/health",
			shares: {
				create: "POST /api/shares",
				fetch: "GET /api/shares/:shareId",
				list: "GET /api/shares",
				delete: "DELETE /api/shares/:shareId",
				qr: "GET /api/shares/:shareId/qr",
			},
		},
	});
});

// Register routes
app.route("/", shareRoutes);

/**
 * 404 Handler
 */
app.notFound((c) => {
	return c.json(
		{
			success: false,
			error: "not_found",
			message: "Endpoint not found",
			path: c.req.path,
			method: c.req.method,
		},
		404,
	);
});

/**
 * Error handler
 */
app.onError((err, c) => {
	console.error("❌ Unhandled error:", err);

	return c.json(
		{
			success: false,
			error: "internal_server_error",
			message:
				process.env.NODE_ENV === "development"
					? err.message
					: "Internal server error",
		},
		500,
	);
});

// Start server
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🏟️  LTFC Backend API Server                                   ║
║   Feature: Group Invite Links (Feature 2)                      ║
║   Database: SQLite (sql.js)                                    ║
║   Framework: Hono.js                                           ║
║                                                                ║
║   ✅ Starting on port ${port}...                                    ║
╚════════════════════════════════════════════════════════════════╝
`);

export default {
	port,
	fetch: app.fetch,
};

// For local development with Node.js
if (import.meta.main) {
	const { serve } = await import("@hono/node-server");

	// Initialize database before starting server
	await startup();

	serve(
		{
			fetch: app.fetch,
			port,
		},
		(info: { port: number }) => {
			console.log(`✅ Server running at http://localhost:${info.port}`);
			console.log(`📡 API Documentation: http://localhost:${info.port}/`);
		},
	);
}
