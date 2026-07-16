import {
  getClientIp,
  normalizeClientIp,
  rateLimitKeyGenerator,
} from "../src/utils/ip.utils.js";

describe("IP Utilities", () => {
  test("normalizeClientIp strips Azure-style IPv4 ports", () => {
    expect(normalizeClientIp("117.251.86.153:54612")).toBe("117.251.86.153");
  });

  test("normalizeClientIp strips IPv4-mapped IPv6 prefix", () => {
    expect(normalizeClientIp("::ffff:117.251.86.153")).toBe("117.251.86.153");
  });

  test("getClientIp prefers the first X-Forwarded-For value", () => {
    const req = {
      headers: {
        "x-forwarded-for": "117.251.86.153:54612, 10.0.0.1",
      },
      ip: "10.0.0.2",
    };

    expect(getClientIp(req)).toBe("117.251.86.153");
  });

  test("getClientIp handles array in X-Forwarded-For", () => {
    const req = {
      headers: {
        "x-forwarded-for": ["117.251.86.153:54612", "10.0.0.1"],
      },
    };
    expect(getClientIp(req)).toBe("117.251.86.153");
  });

  test("getClientIp handles fallback to req.ip", () => {
    const req = {
      headers: {},
      ip: "192.168.1.100",
    };
    expect(getClientIp(req)).toBe("192.168.1.100");
  });

  test("getClientIp handles fallback to req.socket.remoteAddress", () => {
    const req = {
      headers: {},
      socket: {
        remoteAddress: "127.0.0.1",
      },
    };
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  test("getClientIp handles fallback to unknown", () => {
    const req = {};
    expect(getClientIp(req)).toBe("unknown");
  });

  test("rateLimitKeyGenerator returns a clean key for forwarded IPv4 with port", () => {
    const req = {
      headers: {
        "x-forwarded-for": "117.251.86.153:54612",
      },
      ip: "10.0.0.2",
    };

    expect(rateLimitKeyGenerator(req)).toBe("117.251.86.153");
  });
});
