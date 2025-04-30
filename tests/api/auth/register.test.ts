/** @jest-environment node */
/**
 * tests/api/register.route.test.ts
 *
 * Проверяет POST /api/auth/register с учётом обёртки apiRoute.
 * Использует next-test-api-route-handler v4.
 */

import { testApiHandler } from "next-test-api-route-handler";
import * as registerHandler from "@/app/api/auth/register/route";

/* ─────────  mocks  ───────── */
jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    $disconnect: jest.fn(),
  },
}));
jest.mock("bcrypt", () => ({ hash: jest.fn(() => "hashed-password") }));
jest.mock("@/utils/rateLimiter", () => ({ rateLimit: jest.fn() }));

// apiRoute всегда дёргает сессию
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: null })),
}));
jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));

// регистр-схему заглушаем, чтобы валидация «проходила»
jest.mock("@/types/registerSchema", () => ({
  registerSchema: {
    safeParse: (data: unknown) => ({ success: true, data }),
  },
}));

/* ─────────  helpers  ───────── */
const prisma = require("@/prisma/prisma-client").default;
const { rateLimit } = require("@/utils/rateLimiter");
const bcrypt = require("bcrypt");

const makeBody = (add: Record<string, unknown> = {}) => ({
  login: "user1",
  name: "Test User",
  password: "123456",
  ...add,
});

/* ─────────  tests  ───────── */
describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => prisma.$disconnect?.());

  it("429 — превышен лимит", async () => {
    rateLimit.mockReturnValue({ allowed: false, retryAfter: 15 });

    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(makeBody()),
        });

        expect(res.status).toBe(429);
        expect(res.headers.get("retry-after")).toBe("15");

        const json = await res.json();
        expect(json).toEqual(
          expect.objectContaining({
            success: false,
            message: expect.stringMatching(/Слишком много попыток/i),
          })
        );
      },
    });
  });

  it("409 — логин уже занят", async () => {
    rateLimit.mockReturnValue({ allowed: true });
    prisma.user.findUnique.mockResolvedValue({ id: 1, login: "user1" });

    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(makeBody()),
        });

        expect(res.status).toBe(409);
        expect(await res.json()).toEqual({
          message: "Логин уже используется",
        });
      },
    });
  });

  it("201 — создаёт пользователя и не отдаёт пароль", async () => {
    rateLimit.mockReturnValue({ allowed: true });
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 2,
      login: "user2",
      name: "New User",
    });

    await testApiHandler({
      appHandler: registerHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(makeBody({ login: "user2", name: "New User" })),
        });

        expect(res.status).toBe(201);
        expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
        expect(prisma.user.create).toHaveBeenCalled();

        const json = await res.json();
        expect(json.message).toBe("Пользователь создан");
        expect(json.user).toEqual({
          id: 2,
          login: "user2",
          name: "New User",
        });
        expect(json.user).not.toHaveProperty("password");
      },
    });
  });
});
