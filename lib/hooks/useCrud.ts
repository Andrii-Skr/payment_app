// hooks/useCrud.ts
import React from "react";

type CrudService<TForm, TRow> = {
  getAll: () => Promise<TRow[]>;
  create: (data: TForm | unknown) => Promise<void>;
  delete: (id: string | number) => Promise<void>;
};

export function useCrud<TForm, TRow>(service: CrudService<TForm, TRow>, map?: (data: TForm) => unknown) {
  const [rows, setRows] = React.useState<TRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAll();
      setRows(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [service]);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async (form: TForm) => {
    await service.create(map ? map(form) : form);
    await load();
  };

  const remove = async (id: string | number) => {
    await service.delete(id);
    await load();
  };

  return { rows, loading, error, create, remove };
}
