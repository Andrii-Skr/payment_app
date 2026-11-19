import { zodResolver as baseZodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod/v3";

/**
 * Keeps the existing Zod 3 schema semantics while the project uses the
 * security-patched Zod 4 package (which exposes Zod 3 through `zod/v3`).
 */
export function zodResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues, any, any>,
): Resolver<TFieldValues> {
  return baseZodResolver(schema as never) as Resolver<TFieldValues>;
}
