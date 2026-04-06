import { Client, Key } from "@relevanceai/sdk";
import { AGENT_ID, PROJECT, REGION, WORKFORCE_ID } from "@/core/constant";
import { client, connectionError } from "@/core/signals";

const hasConnectionTarget = Boolean(WORKFORCE_ID || AGENT_ID);
const hasCoreEnv = Boolean(REGION && PROJECT);

const isPlaceholderValue = (value: string | undefined): boolean =>
	!value ||
	value.startsWith("your-") ||
	value === "your-region" ||
	value === "your-project" ||
	value === "your-agent-id" ||
	value === "your-workforce-id";

const isCoreEnvValid =
	!isPlaceholderValue(REGION) && !isPlaceholderValue(PROJECT);

const isConnectionTargetValid = WORKFORCE_ID
	? !isPlaceholderValue(WORKFORCE_ID)
	: !isPlaceholderValue(AGENT_ID);

if (
	!hasCoreEnv ||
	!hasConnectionTarget ||
	!isCoreEnvValid ||
	!isConnectionTargetValid
) {
	connectionError.value =
		"Missing Relevance AI credentials. Please update .env with:\n" +
		"1. VITE_REGION - Your Relevance AI region code\n" +
		"2. VITE_PROJECT - Your project ID (UUID)\n" +
		"3. VITE_AGENT_ID or VITE_WORKFORCE_ID - Your agent or workforce ID\n\n" +
		"Then restart the dev server.";
} else {
	console.log("🔄 Initializing Relevance AI client with credentials...", {
		REGION,
		PROJECT: PROJECT ? "***" : "MISSING",
		AGENT_ID: AGENT_ID ? "***" : "MISSING",
		WORKFORCE_ID: WORKFORCE_ID ? "***" : "MISSING",
	});

	// Helper function: timeout promise wrapper (90 seconds)
	const withTimeout = <T>(
		promise: Promise<T>,
		timeoutMs: number,
	): Promise<T> => {
		return Promise.race([
			promise,
			new Promise<T>((_, reject) =>
				setTimeout(
					() =>
						reject(
							new Error(
								`Client initialization timeout after ${timeoutMs / 1000}s`,
							),
						),
					timeoutMs,
				),
			),
		]);
	};

	const initPromise = Promise.resolve(tryStoredEmbedKey())
		.then((key) => {
			console.log("✅ Using stored embed key or will generate new one");
			return key ?? generateEmbedKey();
		})
		.then((key) => {
			console.log("✅ Embed key acquired, creating Client...");
			client.value = new Client(key);
			connectionError.value = "";
			console.log("✅ Relevance AI client initialized successfully");
		});

	withTimeout(initPromise, 90000) // 90 second timeout
		.catch((error) => {
			console.error("❌ Failed to initialize Relevance AI client:", error);
			const isTimeout = error?.message?.includes("timeout");
			connectionError.value = isTimeout
				? "Connection is taking longer than expected (90s timeout). Check your internet connection and try reloading."
				: "Could not initialise Relevance AI credentials. " +
					"Verify your .env values and reload the app.\n\n" +
					`Error: ${error?.message || String(error)}`;
		});
}

async function generateEmbedKey() {
	const key = await Key.generateEmbedKey({
		region: REGION,
		project: PROJECT,
		...(WORKFORCE_ID ? { workforceId: WORKFORCE_ID } : { agentId: AGENT_ID }),
	});

	const { key: embedKey, taskPrefix } = key.toJSON();
	const storageKey = WORKFORCE_ID ? `r-wf-${WORKFORCE_ID}` : `r-${AGENT_ID}`;
	localStorage.setItem(
		storageKey,
		JSON.stringify({
			embedKey: embedKey,
			conversationPrefix: taskPrefix,
		}),
	);

	return key;
}

function tryStoredEmbedKey() {
	try {
		const storageKey = WORKFORCE_ID ? `r-wf-${WORKFORCE_ID}` : `r-${AGENT_ID}`;
		const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");

		if (stored?.embedKey && stored?.conversationPrefix) {
			return new Key({
				key: stored.embedKey,
				region: REGION,
				project: PROJECT,
				...(WORKFORCE_ID
					? { workforceId: WORKFORCE_ID }
					: { agentId: AGENT_ID }),
				taskPrefix: stored.conversationPrefix,
			});
		}
	} catch (_) {
		// silent
	}
	return null;
}
