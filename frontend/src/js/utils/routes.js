const ROUTES = {
  home: "/",
  login: "/login/",
  form: "/form",
  score: "/score",
};

export function redirect(name) {
  const path = ROUTES[name];
  if (path) window.location.assign(path);
}

export function isPublicPage() {
  const p = window.location.pathname;
  return p.startsWith("/login/") || p.startsWith("/register/");
}
