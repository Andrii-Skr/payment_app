import { testApiHandler } from "next-test-api-route-handler";
import * as partnerHandler from "@api/partners/[id]/route";
import * as checkEdrpouHandler from "@api/partners/check-edrpou/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    partners_on_entities: { findMany: jest.fn() },
    partners: { findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
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

describe("partner routes filter accounts without entity relation", () => {
  afterAll(async () => prisma.$disconnect?.());

  it("GET /partners/[id] omits accounts without relation", async () => {
    prisma.partners_on_entities.findMany.mockResolvedValue([
      {
        partner: {
          id: 3,
          partner_account_number: [],
          entities: [
            { entity_id: 2, partner_id: 3, is_deleted: false, is_visible: true },
          ],
        },
      },
    ]);

    await testApiHandler({
      appHandler: partnerHandler,
      params: { id: "2" },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data[0].partner_account_number).toEqual([]);
      },
    });
  });

  it("GET /partners/check-edrpou omits accounts without relation", async () => {
    prisma.partners.findFirst.mockResolvedValue({
      id: 3,
      partner_account_number: [],
    });

    await testApiHandler({
      appHandler: checkEdrpouHandler,
      url: "http://test?edrpou=555&entity_id=2",
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.partner.partner_account_number).toEqual([]);
      },
    });
  });
});
