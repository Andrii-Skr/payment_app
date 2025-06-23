import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/users/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    user: { findMany: jest.fn() },
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

const prisma = require("@/prisma/prisma-client").default;
const { getServerSession } = require("next-auth");

describe("/users route", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 GET без сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 GET фильтрует удалённые по умолчанию", async () => {
    prisma.user.findMany.mockResolvedValueOnce([]);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        expect(prisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { is_deleted: false } })
        );
      },
    });
  });

  it("200 GET withDeleted=true убирает фильтр", async () => {
    prisma.user.findMany.mockResolvedValueOnce([]);

    await testApiHandler({
      appHandler: handler,
      url: "http://test?withDeleted=true",
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        expect(prisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: {} })
        );
      },
    });
  });
});
