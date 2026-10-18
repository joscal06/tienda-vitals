import Link from "next/link";

type Props = {
  page: number;
  lastPage: number;
  basePath: string;
  label: string;
};

export function Pagination({ page, lastPage, basePath, label }: Props) {
  if (lastPage <= 1) return null;
  const href = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const linkBase = "grid min-w-10 place-items-center rounded-lg px-3 py-2 text-sm font-medium";

  return (
    <nav aria-label={label} className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${linkBase} text-zinc-700 hover:bg-zinc-100`} rel="prev">
          ← Anterior
        </Link>
      ) : (
        <span className={`${linkBase} text-zinc-500`}>← Anterior</span>
      )}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={`${linkBase} bg-brand-600 text-white`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={`${linkBase} text-zinc-700 hover:bg-zinc-100`}>
            {p}
          </Link>
        ),
      )}
      {page < lastPage ? (
        <Link href={href(page + 1)} className={`${linkBase} text-zinc-700 hover:bg-zinc-100`} rel="next">
          Siguiente →
        </Link>
      ) : (
        <span className={`${linkBase} text-zinc-500`}>Siguiente →</span>
      )}
    </nav>
  );
}
