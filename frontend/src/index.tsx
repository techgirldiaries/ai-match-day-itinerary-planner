import { render } from "preact";
import { Suspense } from "preact/compat";
import { App } from "@/components/app";
import "@/services/client"; // Initialize Relevance AI client
import { client } from "@/core/state";

console.log("🚀 Index.tsx loading, attempting to mount app...");

// Validation: Verify critical imports and initialization
(function validateImports() {
  const checks = {
    "services/client.ts": Boolean(client),
  };

  const allValid = Object.values(checks).every(Boolean);

  if (allValid) {
    console.log("âœ… All critical imports validated successfully");
  } else {
    const failed = Object.entries(checks)
      .filter(([_, valid]) => !valid)
      .map(([name]) => name);
    console.warn(
      `âš ï¸ Import validation warning: Missing initialization for: ${failed.join(", ")}`,
    );
  }
})();

const appElement = document.getElementById("app");
if (!appElement) {
  console.error("âŒ Could not find #app element in DOM");
  document.body.innerHTML =
    '<div style="color: red; padding: 20px;">ERROR: Could not mount app - #app element not found</div>';
} else {
  try {
    render(
      <Suspense fallback={<em>loading...</em>}>
        <App />
      </Suspense>,
      appElement,
    );
    console.log("âœ… App mounted successfully");
  } catch (error) {
    console.error("âŒ Error mounting app:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    appElement.innerHTML = `<div style="color: red; padding: 20px;">ERROR: ${errorMessage}</div>`;
  }
}
