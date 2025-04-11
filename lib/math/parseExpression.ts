
import { evaluate } from "mathjs";

export const parseExpression = (value: string): string => {
  try {
    const result = evaluate(value.slice(1));
    return Number(result).toFixed(2);
  } catch {
    return "Ошибка";
  }
};
