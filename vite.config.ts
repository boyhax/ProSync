import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", { target: "18" }]],
        },
      }),
      tailwindcss(),
      nitro(),
    ],
    
    // resolve: {
    //   alias: {
    //     "@": path.resolve(__dirname, "."),
    //   },
    // },
  };
});
