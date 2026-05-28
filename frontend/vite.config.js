import { resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        form: resolve(__dirname, "form.html"),
        score: resolve(__dirname, "score.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        history: resolve(__dirname, "history.html")
      }
    }
  }
});
