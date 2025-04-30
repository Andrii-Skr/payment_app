/** @jest-environment node */
/**
 * Проверяет POST /api/documents/create
 */
import { testApiHandler } from "next-test-api-route-handler";
import * as docCreate from '@api/documents/route';

/* ─── mocks ─── */
jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: { documents: { create: jest.fn() }, $disconnect: jest.fn() },
}));
jest.mock("@/lib/access/hasRole", () => ({
  hasRole: (role: string, need: string) => role === need,
}));
jest.mock("@/constants/roles", () => ({
  Roles: { ADMIN: "ADMIN", MANAGER: "MANAGER", USER: "USER" },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: null })),
}));
jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));

const prisma = require("@/prisma/prisma-client").default;
const { getServerSession } = require("next-auth");
const sess = (role: string) => ({ user: { id: "1", role } });

const body = {
  id: 1,
  partner_id: 2,
  accountNumber: "123",
  partner_account_number_id: 3,
  date: "2024-01-01",
  accountSum: 100,
  accountSumExpression: "100",
  vatType: false,
  vatPercent: 0,
  purposeOfPayment: "Pay",
  payments: [],
};

/* ─── tests ─── */
describe("POST /documents", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => prisma.$disconnect?.());

  it("401 (нет сессии)", async () => {
    getServerSession.mockResolvedValue({ user: null });

    await testApiHandler({
      appHandler: docCreate,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("403 для USER", async () => {
    getServerSession.mockResolvedValue(sess("USER"));

    await testApiHandler({
      appHandler: docCreate,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(403);
      },
    });
  });

  it("200 для MANAGER", async () => {
    getServerSession.mockResolvedValue(sess("MANAGER"));
    prisma.documents.create.mockResolvedValue({ id: 10 });

    await testApiHandler({
      appHandler: docCreate,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
          success: true,
          message: "Document created successfully.",
          result: { id: 10 },
        });
      },
    });
  });
});
