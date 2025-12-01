/** @jest-environment node */

let rateLimit: (
  ip: string,
  login: string,
) => {
  allowed: boolean;
  retryAfter?: number;
  reason?: "ip" | "login";
};
let resetRateLimit: (ip: string, login: string) => void;

const ip = "127.0.0.1";
const login = "user";
let now = 0;

beforeEach(() => {
  jest.resetModules();
  now = 0;
  jest.spyOn(Date, "now").mockImplementation(() => now);
  const rl = require("@/utils/rateLimiter");
  rateLimit = rl.rateLimit;
  resetRateLimit = rl.resetRateLimit;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("rateLimit", () => {
  it("blocks after exceeding attempts", () => {
    for (let i = 0; i < 5; i++) {
      const res = rateLimit(ip, login);
      expect(res).toEqual({ allowed: true });
    }

    const blocked = rateLimit(ip, login);
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toBe("ip");
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("allows again after reset", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, login);
    }
    expect(rateLimit(ip, login).allowed).toBe(false);

    resetRateLimit(ip, login);

    const res = rateLimit(ip, login);
    expect(res).toEqual({ allowed: true });
  });
});
