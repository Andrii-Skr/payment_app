import * as partnerHandler from "@api/partners/[id]/route";
import * as checkEdrpouHandler from "@api/partners/check-edrpou/route";
import { testApiHandler } from "next-test-api-route-handler";
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
  getServerSession: jest.fn(() => Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));

const prisma = require("@/prisma/prisma-client").default;

describe("partner routes include account entities", () => {
  afterAll(async () => prisma.$disconnect?.());

  it("GET /partners/[id] returns account entities", async () => {
    prisma.partners_on_entities.findMany.mockResolvedValue([
      {
        partner: {
          id: 2,
          partner_account_number: [
            {
              id: 5,
              bank_account: "123",
              entities: [
                {
                  entity_id: 1,
                  partner_account_number_id: 5,
                  is_visible: true,
                  is_default: true,
                  is_deleted: false,
                },
              ],
            },
          ],
          entities: [
            {
              entity_id: 1,
              partner_id: 2,
              is_deleted: false,
              is_visible: true,
            },
          ],
        },
      },
    ]);

    await testApiHandler({
      appHandler: partnerHandler,
      params: { id: "1" },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data[0].partner_account_number[0].entities[0]).toEqual({
          entity_id: 1,
          partner_account_number_id: 5,
          is_visible: true,
          is_default: true,
          is_deleted: false,
        });
      },
    });
  });

  it("GET /partners/check-edrpou returns account entities", async () => {
    prisma.partners.findFirst.mockResolvedValue({
      id: 2,
      partner_account_number: [
        {
          id: 6,
          bank_account: "456",
          entities: [
            {
              entity_id: 1,
              partner_account_number_id: 6,
              is_visible: false,
              is_default: false,
              is_deleted: false,
            },
          ],
        },
      ],
    });

    await testApiHandler({
      appHandler: checkEdrpouHandler,
      url: "http://test?edrpou=123&entity_id=1",
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.partner.partner_account_number[0].entities[0]).toEqual({
          entity_id: 1,
          partner_account_number_id: 6,
          is_visible: false,
          is_default: false,
          is_deleted: false,
        });
      },
    });
  });
});
