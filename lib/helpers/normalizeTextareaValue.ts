export const normalizeTextareaValue = (value: string): string => value.replace(/\r\n/g, "\n").trim();

export const normalizeOptionalTextareaValue = (value?: string | null): string | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = normalizeTextareaValue(value);
  return normalized.length > 0 ? normalized : undefined;
};
