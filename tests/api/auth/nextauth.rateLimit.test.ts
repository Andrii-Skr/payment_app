jest.mock("@/utils/rateLimiter", () => ({ rateLimit: jest.fn() }));

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    $disconnect: jest.fn(),
  },
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() =>
    jest.fn(() => Promise.resolve(new Response(null, { status: 200 })))
  ),
  getToken: jest.fn(() => ({ sub: "1" })),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));

const prisma = require("@/prisma/prisma-client").default;

/**
 * Проверяет, что authorize возвращает null при срабатывании rate limiter
 */
describe("auth nextauth rate limit", () => {
  afterAll(async () => prisma.$disconnect?.());
  it("authorize возвращает null при превышении лимита", async () => {

    jest.clearAllMocks();
    const { rateLimit } = require("@/utils/rateLimiter");
    const { authOptions } = jest.requireActual("@/lib/authOptions");

    rateLimit.mockReturnValue({ allowed: false, retryAfter: 10, reason: "ip" });

    const authorize = (authOptions.providers[0] as any).authorize;

    const result = await authorize(
      { login: "user1", password: "pass" },
      { headers: { "x-real-ip": "127.0.0.1" } } as any
    );

    expect(rateLimit).toHaveBeenCalledWith("127.0.0.1", "user1");
    expect(result).toBeNull();
  });
});
