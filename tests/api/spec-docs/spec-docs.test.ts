import * as handler from "@api/spec-docs/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    spec_doc: { updateMany: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
    $disconnect: jest.fn(),
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));
jest.mock("@/lib/access/hasRole", () => ({ hasRole: jest.fn(() => true) }));

const prisma = require("@/prisma/prisma-client").default;
const { hasRole } = require("@/lib/access/hasRole");
const { getServerSession } = require("next-auth");

describe("POST /spec-docs", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ specDocIds: [1] }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("403 если нет роли администратора", async () => {
    hasRole.mockReturnValueOnce(false);
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ specDocIds: [1] }),
        });
        expect(res.status).toBe(403);
      },
    });
  });

  it("400 при пустом списке", async () => {
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ specDocIds: [] }),
        });
        expect(res.status).toBe(400);
      },
    });
  });

  it("404 если ничего не обновлено", async () => {
    prisma.spec_doc.updateMany.mockResolvedValueOnce({ count: 0 });
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ specDocIds: [1] }),
        });
        expect(res.status).toBe(404);
      },
    });
  });

  it("200 при успешном обновлении", async () => {
    prisma.spec_doc.updateMany.mockResolvedValueOnce({ count: 1 });
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ specDocIds: [1] }),
        });
        expect(res.status).toBe(200);
      },
    });
  });
});
