export const config = {
  webappUrl: import.meta.env.VITE_WEBAPP_URL || 'http://localhost:3000',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
};

export const routes = {
  login: "/login",
  // MVP has no login — "Coba Sekarang" CTAs open the app directly.
  app: "/app",
};
