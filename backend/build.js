import { execSync } from "child_process";

try {
  console.log("Running TypeScript compiler...");
  execSync("tsc", { stdio: "inherit" });

  console.log("Running Vite build...");
  execSync("vite build", { stdio: "inherit" });
} catch (error) {
  process.exit(1);
}
