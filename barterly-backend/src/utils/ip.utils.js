import { ipKeyGenerator } from "express-rate-limit";

const IPV4_WITH_PORT_PATTERN = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/;

export const normalizeClientIp = (ip = "") =>
  ip
    .trim()
    .replace(/^::ffff:/, "")
    .replace(IPV4_WITH_PORT_PATTERN, "$1");

export const getClientIp = (req) => {
  const forwardedFor = req.headers?.["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0];

  return normalizeClientIp(
    forwardedIp || req.ip || req.socket?.remoteAddress || "unknown",
  );
};

export const rateLimitKeyGenerator = (req) => ipKeyGenerator(getClientIp(req));
