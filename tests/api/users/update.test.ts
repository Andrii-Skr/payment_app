import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/users/update/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    user: { update: jest.fn() },
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

describe("PATCH /users/update", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ user_id: 1, login: "l", name: "n", role_id: 2 }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 обновляет пользователя", async () => {
    prisma.user.update.mockResolvedValueOnce({ id: 1 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            user_id: 1,
            login: "test",
            name: "Test",
            role_id: 2,
          }),
        });
        expect(res.status).toBe(200);
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { login: "test", name: "Test", role_id: 2 },
          include: { role: true },
        });
      },
    });
  });
});
