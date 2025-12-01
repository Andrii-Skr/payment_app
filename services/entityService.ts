import type { entity } from "@prisma/client";
import { getById } from "@/services/entities";

const cache = new Map<number, entity>();

/** Берём сущность из кэша или подгружаем из API */
export const fetchEntity = async (id: number): Promise<entity | null> => {
  if (cache.has(id)) return cache.get(id)!;
  const data = await getById(id);
  if (data) cache.set(id, data);
  return data;
};

/** Утилита для пакетной загрузки */
export const fetchEntitiesBatch = async (ids: number[]): Promise<Map<number, entity>> => {
  await Promise.all(ids.map(fetchEntity));
  return cache;
};
