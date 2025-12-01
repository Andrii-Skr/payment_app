import * as handler from "@api/documents/entities/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    entity: { findMany: jest.fn() },
    user: { findUnique: jest.fn() },
    partners_on_entities: { findMany: jest.fn() },
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
const { getServerSession } = require("next-auth");

describe("GET /documents/entities", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 возвращает список", async () => {
    prisma.entity.findMany.mockResolvedValueOnce([]);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
      },
    });
  });

  it("фильтрует контрагентов по правам", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { id: 1, role: Roles.MANAGER },
    });

    prisma.user.findUnique.mockResolvedValueOnce({
      users_partners: [{ partner_id: 10, entity_id: 1 }],
      users_entities: [{ entity_id: 1 }],
    });

    prisma.entity.findMany.mockResolvedValueOnce([
      {
        id: 1,
        full_name: "",
        short_name: "",
        edrpou: "",
        bank_account: "",
        bank_name: "",
        mfo: "",
        sort_order: 0,
        documents: [{ partner_id: 10 }, { partner_id: 11 }],
        partners: [
          { partner_id: 10, partner: { id: 10, full_name: "", short_name: "", edrpou: "" } },
          { partner_id: 11, partner: { id: 11, full_name: "", short_name: "", edrpou: "" } },
        ],
      },
    ]);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data[0].partners).toHaveLength(1);
        expect(data[0].partners[0].partner_id).toBe(10);
        expect(data[0].documents).toHaveLength(1);
        expect(data[0].documents[0].partner_id).toBe(10);
      },
    });
  });

  it("возвращает пустой массив если есть доступ только через партнеров", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { id: 1, role: Roles.MANAGER },
    });

    prisma.user.findUnique.mockResolvedValueOnce({
      users_partners: [{ partner_id: 10, entity_id: 1 }],
      users_entities: [],
    });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual([]);
      },
    });
  });
});
