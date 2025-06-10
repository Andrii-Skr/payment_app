import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/regular-payments/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    auto_payment: { create: jest.fn(), findMany: jest.fn() },
    documents: { update: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
    $disconnect: jest.fn(),
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })
  ),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));

jest.mock("@/lib/access/hasRole", () => ({ hasRole: jest.fn(() => true) }));

const prisma = require("@/prisma/prisma-client").default;
const { hasRole } = require("@/lib/access/hasRole");
const { getServerSession } = require("next-auth");

describe("regular-payments route", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 для GET без сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(401);
      },
    });
  });

  it("403 для GET без роли администратора", async () => {
    hasRole.mockReturnValueOnce(false);
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(403);
      },
    });
  });

  it("200 GET возвращает данные", async () => {
    prisma.auto_payment.findMany.mockResolvedValueOnce([]);
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
      },
    });
  });

  it("401 POST без сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ documents_id: 1, paySum: 1, vatType: false, vatPercent: 0, userId: 1 }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 POST создаёт запись", async () => {
    prisma.auto_payment.create.mockResolvedValueOnce({ id: 1 });
    prisma.documents.update.mockResolvedValueOnce({});
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ documents_id: 1, paySum: 5, vatType: false, vatPercent: 0, userId: 1 }),
        });
        expect(res.status).toBe(200);
      },
    });
  });
});
