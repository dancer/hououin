import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";

export default defineConfig({
  extends: [core, next],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      files: ["**/opengraph-image.tsx", "**/twitter-image.tsx"],
      plugins: ["nextjs"],
      rules: { "nextjs/no-img-element": "off" },
    },
  ],
});
