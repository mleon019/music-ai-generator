import { resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const routeEntries = {
  "/": "/pages/index.html",
  "/form/": "/pages/form/index.html",
  "/score/": "/pages/score/index.html",
  "/login/": "/pages/login/index.html",
  "/register/": "/pages/register/index.html",
  "/history/": "/pages/history/index.html",
  "/profile/": "/pages/profile/index.html"
};

const legacyRedirects = {
  "/index.html": "/",
  "/form.html": "/form/",
  "/score.html": "/score/",
  "/login.html": "/login/",
  "/register.html": "/register/",
  "/history.html": "/history/",
  "/profile.html": "/profile/"
};

function cleanUrlMiddleware(req, res, next) {
  if (!req.url) {
    return next();
  }
  
  const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  
  const base = `${protocol}://${req.headers.host || 'localhost'}`;
  const requestUrl = new URL(req.url, base);
  const pathname = requestUrl.pathname;

  if (legacyRedirects[pathname]) {
    res.statusCode = 302;
    res.setHeader("Location", legacyRedirects[pathname]);
    res.end();
    return;
  }

  if (pathname !== "/" && pathname.endsWith(".html")) {
    const cleanPath = pathname.replace(/\.html$/, "/").replace(/\/index\/$/, "/");
    res.statusCode = 302;
    res.setHeader("Location", cleanPath);
    res.end();
    return;
  }

  const normalizedPath = pathname === "/" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;
  const mappedEntry = routeEntries[normalizedPath];

  if (mappedEntry) {
    req.url = `${mappedEntry}${requestUrl.search}`;
  }

  return next();
}

function cleanUrlsPlugin() {
  return {
    name: "clean-urls-mpa",
    configureServer(server) {
      server.middlewares.use(cleanUrlMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(cleanUrlMiddleware);
    }
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [cleanUrlsPlugin()],
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
        main: resolve(__dirname, "pages/index.html"),
        form: resolve(__dirname, "pages/form/index.html"),
        score: resolve(__dirname, "pages/score/index.html"),
        login: resolve(__dirname, "pages/login/index.html"),
        register: resolve(__dirname, "pages/register/index.html"),
        history: resolve(__dirname, "pages/history/index.html"),
        profile: resolve(__dirname, "pages/profile/index.html")
      }
    }
  }
});
