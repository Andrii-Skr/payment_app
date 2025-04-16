import { fullDocumentSelect } from "@/prisma/data/documents";

export function fullEntitySelect() {
  return {
    id: true,
    name: true,
    documents: {
      where: {
        is_paid: false,
        is_deleted: false,
      },
      select: fullDocumentSelect(),
    },
  };
}
