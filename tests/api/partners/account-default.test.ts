import * as handler from "@api/partners/account/default/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    partner_account_number: { findUnique: jest.fn() },
    partner_account_numbers_on_entities: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn) =>
      fn({
        partner_account_numbers_on_entities: {
          updateMany: jest.fn(),
          update: jest.fn(),
        },
      }),
    ),
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

describe("PATCH /partners/account/default", () => {
  afterAll(async () => prisma.$disconnect?.());

  it("updates default flag and resets others", async () => {
    prisma.partner_account_number.findUnique.mockResolvedValue({ partner_id: 1 });
    const updateMany = jest.fn();
    const update = jest.fn();
    prisma.$transaction.mockImplementation(async (fn: any) =>
      fn({
        partner_account_numbers_on_entities: {
          updateMany,
          update,
        },
      }),
    );

    await testApiHandler({
      appHandler: handler,
      params: {},
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_account_number_id: 5,
            entity_id: 2,
            is_default: true,
          }),
        });
        expect(res.status).toBe(200);
        expect(updateMany).toHaveBeenCalledWith({
          where: {
            entity_id: 2,
            partner_account_number: { partner_id: 1 },
          },
          data: { is_default: false },
        });
        expect(update).toHaveBeenCalledWith({
          where: {
            entity_id_partner_account_number_id: {
              entity_id: 2,
              partner_account_number_id: 5,
            },
          },
          data: { is_default: true },
        });
      },
    });
  });
});
