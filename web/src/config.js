export const config = {
  webappUrl: import.meta.env.VITE_WEBAPP_URL || 'http://localhost:3000',
};

export const routes = {
  login: `${config.webappUrl}/auth/login`,
};
