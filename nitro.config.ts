<<<<<<< HEAD
import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  compatibilityDate: "2024-04-03",
  srcDir: "server",
=======
import { defineNitroConfig } from 'nitro/config';

export default defineNitroConfig({
  preset: 'vercel',
  serverDir: 'server',
  publicAssets: [
    {
      dir: 'dist',
      maxAge: 60 * 60 * 24 * 365,
      baseURL: '/',
    },
  ],
>>>>>>> d322979 (feat: Implement SurrealDB adapter and connection management)
});
