import { NextRequest } from "next/server";

type HandlerModule = Record<
  string,
  (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Response | Promise<Response>
>;

type FetchInit = RequestInit & { url?: string };

type TestApiHandlerParams = {
  appHandler: HandlerModule;
  params?: Record<string, string>;
  url?: string;
  test: (helpers: { fetch: (init?: FetchInit) => Promise<Response> }) => Promise<void> | void;
};

export async function testApiHandler({ appHandler, params = {}, url, test }: TestApiHandlerParams) {
  const baseUrl = url ?? "http://localhost";
  const handler = appHandler as HandlerModule;

  const fetchImpl = async (init: FetchInit = {}) => {
    const method = (init.method ?? "GET").toUpperCase();
    const routeHandler = handler[method];

    if (!routeHandler) {
      throw new Error(`next-test-api-route-handler mock: no handler for method ${method}`);
    }

    const requestUrl = init.url ?? baseUrl;
    const request = new NextRequest(requestUrl, {
      method,
      headers: init.headers,
      body: init.body as BodyInit | null | undefined,
    });

    const response = await routeHandler(request, { params: Promise.resolve(params) });
    return response as unknown as Response;
  };

  await test({ fetch: fetchImpl });
}
