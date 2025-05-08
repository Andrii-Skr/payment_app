// удаляем потенциально чувствительные поля перед логированием
export function redactBody(payload: unknown): unknown {
  if (typeof payload !== "object" || payload === null) return payload;
  const SENSITIVE = ["password", "token", "secret"];
  const clone: any = Array.isArray(payload) ? [...payload] : { ...payload };

  for (const key of Object.keys(clone)) {
    if (SENSITIVE.includes(key.toLowerCase())) {
      clone[key] = "***";
    } else if (typeof clone[key] === "object") {
      clone[key] = redactBody(clone[key]);
    }
  }
  return clone;
}
