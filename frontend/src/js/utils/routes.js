const ROUTES = {
  home: "/index.html",
  login: "/login/",
  form: "/form.html",
  score: "/score.html",
};

export function redirect(name) {
  const path = ROUTES[name];
  if (path) window.location.assign(path);
}

export function isPublicPage() {
  const p = window.location.pathname;
  return p.startsWith("/login/") || p.startsWith("/register/");
}
