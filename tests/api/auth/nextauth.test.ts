import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@/app/api/auth/[...nextauth]/route";

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn(() => Promise.resolve(new Response(null, { status: 200 })))),
  getToken: jest.fn(() => ({ sub: "1" })),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));

describe("auth nextauth route", () => {
  it("проксирует запрос", async () => {
    await testApiHandler({
      appHandler: handler,
      params: { nextauth: ["signin"] },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
      },
    });
  });
});
