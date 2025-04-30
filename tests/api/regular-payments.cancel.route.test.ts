import { deleteById } from "../../services/autoPayments";
/** @jest-environment node */
/**
 * Проверяет PATCH /api/regular-payments/cancel
 */
import { testApiHandler } from "next-test-api-route-handler";
import * as cancelHandler from "@api/regular-payments/delete/route";

/* ─── mocks ─── */
jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    auto_payment: { findUnique: jest.fn(), update: jest.fn() },
    documents: { update: jest.fn() },
    $disconnect: jest.fn(),
  },
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

/* ─── tests ─── */
describe("PATCH /regular-payments/delete", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => prisma.$disconnect?.());

  it("401 (нет сессии)", async () => {
    getServerSession.mockResolvedValue({ user: null });

    await testApiHandler({
      appHandler: cancelHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: 1 }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("403 для USER", async () => {
    getServerSession.mockResolvedValue(sess("USER"));

    await testApiHandler({
      appHandler: cancelHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: 1 }),
        });
        expect(res.status).toBe(403);
      },
    });
  });

  it("400 неверный id", async () => {
    getServerSession.mockResolvedValue(sess("ADMIN"));

    await testApiHandler({
      appHandler: cancelHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: null }),
        });
        expect(res.status).toBe(400);
      },
    });
  });

  it("404 auto_payment не найден", async () => {
    getServerSession.mockResolvedValue(sess("ADMIN"));
    prisma.auto_payment.findUnique.mockResolvedValue(null);

    await testApiHandler({
      appHandler: cancelHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: 999 }),
        });
        expect(res.status).toBe(404);
      },
    });
  });

  it("200 — отменяет платеж", async () => {
    getServerSession.mockResolvedValue(sess("ADMIN"));
    prisma.auto_payment.findUnique.mockResolvedValue({
      id: 1,
      documents_id: 10,
    });
    prisma.auto_payment.update.mockResolvedValue({ id: 1 });
    prisma.documents.update.mockResolvedValue({ id: 10 });

    await testApiHandler({
      appHandler: cancelHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: 1 }),
        });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
          updatedAutoPayment: { id: 1 },
          updatedDocument: { id: 10 },
        });
      },
    });
  });
});
