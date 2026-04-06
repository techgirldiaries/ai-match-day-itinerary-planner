import path from "path";
import { fileURLToPath } from "url";
import { mergeConfig } from "vite";
import baseConfig from "./vite.base";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Backend-specific Vite configuration
export default mergeConfig(baseConfig, {
  build: {
    target: "ES2022",
    ssr: true,
    lib: {
      entry: path.resolve(__dirname, "../../backend/src/index.ts"),
      name: "ltfc-backend",
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "../../build/backend",
    emptyOutDir: true,
    minify: "terser",
    rollupOptions: {
      external: [
        "sql.js",
        // Node.js built-in modules
        "fs",
        "path",
        "http",
        "http2",
        "https",
        "stream",
        "url",
        "crypto",
        "os",
        "util",
        "events",
        "buffer",
      ],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "../../backend/src"),
    },
  },
});
