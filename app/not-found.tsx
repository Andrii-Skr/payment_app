import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
      <h1 className="text-3xl font-bold">Страница не найдена</h1>
      <p className="text-muted-foreground">Похоже, такой страницы не существует.</p>
      <Link
        href="/create"
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:opacity-90 transition"
      >
        На главную
      </Link>
    </div>
  );
}

