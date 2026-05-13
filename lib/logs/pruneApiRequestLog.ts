import prisma from "../../prisma/prisma-client";

const RETENTION_DAYS = 365;

export async function pruneApiRequestLog() {
  if (!(prisma as any).api_request_log?.deleteMany) {
    return { count: 0, deletedBefore: null as Date | null };
  }

  const deletedBefore = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await prisma.api_request_log.deleteMany({
    where: {
      created_at: {
        lt: deletedBefore,
      },
    },
  });

  return { count: result.count, deletedBefore };
}
