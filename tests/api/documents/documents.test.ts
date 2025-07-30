import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/documents/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    documents: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
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

jest.mock("@/lib/date/getSafeDateForPrisma", () => ({ getSafeDateForPrisma: jest.fn(() => null) }));

const prisma = require("@/prisma/prisma-client").default;
const { getSafeDateForPrisma } = require("@/lib/date/getSafeDateForPrisma");
const { getServerSession } = require("next-auth");

describe("/documents route", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если пользователь не авторизован", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(401);
      },
    });
  });

  it("400 при неверной дате", async () => {
    getSafeDateForPrisma.mockReturnValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ date: "wrong" }),
        });
        expect(res.status).toBe(400);
      },
    });
  });

  it("200 возвращает список документов", async () => {
    prisma.documents.findMany.mockResolvedValueOnce([]);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
      },
    });
  });

  it("передает note при создании документа", async () => {
    prisma.documents.create.mockResolvedValueOnce({ id: 1 });
    getSafeDateForPrisma.mockReturnValueOnce(new Date());

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            entity_id: 1,
            partner_id: 1,
            partner_account_number_id: 1,
            accountNumber: "a",
            date: "2020-01-01",
            accountSum: 1,
            accountSumExpression: "1",
            vatType: false,
            vatPercent: 0,
            purposeOfPayment: "",
            payments: [],
            is_auto_purpose_of_payment: true,
            note: "test",
          }),
        });
        expect(res.status).toBe(200);
        expect(prisma.documents.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ note: "test" }),
          })
        );
      },
    });
  });

  it("409 без allowDuplicate если совпадает сумма", async () => {
    getSafeDateForPrisma.mockReturnValueOnce(new Date());
    prisma.documents.findFirst.mockResolvedValueOnce({ account_sum: 10 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            entity_id: 1,
            partner_id: 1,
            partner_account_number_id: 1,
            accountNumber: "a",
            date: "2020-01-01",
            accountSum: 10,
            accountSumExpression: "10",
            vatType: false,
            vatPercent: 0,
            purposeOfPayment: "",
            payments: [],
            is_auto_purpose_of_payment: true,
          }),
        });
        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.allowDuplicate).toBeUndefined();
      },
    });
  });

  it("409 с allowDuplicate если сумма отличается", async () => {
    getSafeDateForPrisma.mockReturnValueOnce(new Date());
    prisma.documents.findFirst.mockResolvedValueOnce({ account_sum: 5 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            entity_id: 1,
            partner_id: 1,
            partner_account_number_id: 1,
            accountNumber: "a",
            date: "2020-01-01",
            accountSum: 10,
            accountSumExpression: "10",
            vatType: false,
            vatPercent: 0,
            purposeOfPayment: "",
            payments: [],
            is_auto_purpose_of_payment: true,
          }),
        });
        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.allowDuplicate).toBe(true);
      },
    });
  });
});
