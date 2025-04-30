/** @jest-environment node */
/**
 * Проверяет GET и POST /api/entities
 */
import { testApiHandler } from "next-test-api-route-handler";
import * as entitiesHandler from "@api/entities/route";

/* ─── mocks ─── */
jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    entity: { findMany: jest.fn(), create: jest.fn() },
    user:   { findUnique: jest.fn() },
    $disconnect: jest.fn(),
  },
}));
jest.mock("@/utils/rateLimiter", () => ({ rateLimit: jest.fn() }));
jest.mock("@/lib/access/hasRole", () => ({
  hasRole: (role: string, need: string) => role === need,
}));
jest.mock("@/constants/roles", () => ({
  Roles: { ADMIN: "ADMIN", MANAGER: "MANAGER", USER: "USER" },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: null })),
}));
jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));

const prisma = require("@/prisma/prisma-client").default;
const { getServerSession } = require("next-auth");

const sess = (role: string, id = 1) => ({ user: { id: String(id), role } });

/* ─── tests ─── */
describe("/api/entities", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => prisma.$disconnect?.());

  it("GET → 401 (нет сессии)", async () => {
    getServerSession.mockResolvedValue({ user: null });

    await testApiHandler({
      appHandler: entitiesHandler,
      url: "/api/entities",
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(401);
      },
    });
  });

  it("GET (admin) → 200 со всеми entity", async () => {
    getServerSession.mockResolvedValue(sess("ADMIN"));
    prisma.entity.findMany.mockResolvedValue([{ id: 1, name: "Corp" }]);

    await testApiHandler({
      appHandler: entitiesHandler,
      url: "/api/entities",
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([{ id: 1, name: "Corp" }]);
      },
    });
  });

  it("POST → 403 для USER", async () => {
    getServerSession.mockResolvedValue(sess("USER"));

    await testApiHandler({
      appHandler: entitiesHandler,
      url: "/api/entities",
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "New",
            type: 1,
            edrpou: "123",
            bank_name: "Bank",
            bank_account: "BA",
            mfo: "305299",
            is_deleted: false,
          }),
        });
        expect(res.status).toBe(403);
      },
    });
  });

  it("POST (admin) → 200 создаёт entity", async () => {
    getServerSession.mockResolvedValue(sess("ADMIN"));
    prisma.entity.create.mockResolvedValue({ id: 5, name: "New" });

    await testApiHandler({
      appHandler: entitiesHandler,
      url: "/api/entities",
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "New",
            type: 1,
            edrpou: "123",
            bank_name: "Bank",
            bank_account: "BA",
            mfo: "305299",
            is_deleted: false,
          }),
        });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ entity: { id: 5, name: "New" } });
      },
    });
  });
});
