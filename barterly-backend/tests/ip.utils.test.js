import assert from "node:assert/strict";
import test from "node:test";
import {
  getClientIp,
  normalizeClientIp,
  rateLimitKeyGenerator,
} from "../src/utils/ip.utils.js";

test("normalizeClientIp strips Azure-style IPv4 ports", () => {
  assert.equal(normalizeClientIp("117.251.86.153:54612"), "117.251.86.153");
});

test("normalizeClientIp strips IPv4-mapped IPv6 prefix", () => {
  assert.equal(normalizeClientIp("::ffff:117.251.86.153"), "117.251.86.153");
});

test("getClientIp prefers the first X-Forwarded-For value", () => {
  const req = {
    headers: {
      "x-forwarded-for": "117.251.86.153:54612, 10.0.0.1",
    },
    ip: "10.0.0.2",
  };

  assert.equal(getClientIp(req), "117.251.86.153");
});

test("rateLimitKeyGenerator returns a clean key for forwarded IPv4 with port", () => {
  const req = {
    headers: {
      "x-forwarded-for": "117.251.86.153:54612",
    },
    ip: "10.0.0.2",
  };

  assert.equal(rateLimitKeyGenerator(req), "117.251.86.153");
});
