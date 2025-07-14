import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/users/route";
import { Roles } from "@/constants/roles";

let mockPrisma: any;
jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  get default() {
    return mockPrisma;
  },
}));

mockPrisma = {
  users_entities: { createMany: jest.fn(), deleteMany: jest.fn() },
  users_partners: { createMany: jest.fn(), deleteMany: jest.fn() },
  api_request_log: { create: jest.fn().mockResolvedValue(null) },
  $transaction: (fn: any) => fn(mockPrisma),
  $disconnect: jest.fn(),
};

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })
  ),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));

const prisma = require("@/prisma/prisma-client").default;
const { getServerSession } = require("next-auth");

describe("POST /users rights", () => {
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
          body: JSON.stringify({ user_id: 1 }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 обновляет права", async () => {
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const body = {
          user_id: 1,
          add_partners: [{ partner_id: 2, entity_id: 3 }],
          remove_partners: [{ partner_id: 4, entity_id: 5 }],
        };
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(200);
        expect(prisma.users_partners.createMany).toHaveBeenCalledWith({
          data: [{ user_id: 1, partner_id: 2, entity_id: 3 }],
          skipDuplicates: true,
        });
        expect(prisma.users_partners.deleteMany).toHaveBeenCalledWith({
          where: {
            user_id: 1,
            OR: [{ partner_id: 4, entity_id: 5 }],
          },
        });
      },
    });
  });
});
