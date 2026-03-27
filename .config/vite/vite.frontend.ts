import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwind from "@tailwindcss/vite";
import baseConfig from "./vite.base";

// Frontend-specific Vite configuration
export default mergeConfig(baseConfig, {
  plugins: [preact(), tailwind()],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "@": fileURLToPath(new URL("../../frontend/src", import.meta.url)),
      "node:crypto": fileURLToPath(
        new URL("../../frontend/src/shims/crypto.ts", import.meta.url),
      ),
    },
  },
});
