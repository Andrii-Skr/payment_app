import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/users/password/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    user: { update: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
    $disconnect: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({ hash: jest.fn(() => "hashed") }));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })
  ),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));

const prisma = require("@/prisma/prisma-client").default;
const bcrypt = require("bcrypt");
const { getServerSession } = require("next-auth");

describe("PATCH /users/password", () => {
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
          body: JSON.stringify({ user_id: 1, password: "123456" }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 обновляет пароль", async () => {
    prisma.user.update.mockResolvedValueOnce({ id: 1 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ user_id: 1, password: "newpass" }),
        });
        expect(res.status).toBe(200);
        expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { password: "hashed" },
        });
      },
    });
  });
});
