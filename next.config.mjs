import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV !== "production";

const withPWAPlugin = withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true
});

export default withPWAPlugin({
  reactStrictMode: true
});
