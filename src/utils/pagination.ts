export const PAGE_SIZE = 25;

export interface Page<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
    totalItems: items.length,
  };
}

export function pageUrl(baseUrl: string, page: number): string {
  return page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
}
