import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare-module",
  serverDir: "server",
  publicAssets: [
    {
      dir: "dist",
      maxAge: 60 * 60 * 24 * 365,
      baseURL: "/",
    },
  ],
});
