import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/partners/delete/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    partners_on_entities: { update: jest.fn() },
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

describe("PATCH /partners/delete", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ partner_id: 1, entity_id: 1, is_deleted: true }) });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 обновляет запись", async () => {
    prisma.partners_on_entities.update.mockResolvedValueOnce({});

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ partner_id: 1, entity_id: 1, is_deleted: true }) });
        expect(res.status).toBe(200);
      },
    });
  });
});
