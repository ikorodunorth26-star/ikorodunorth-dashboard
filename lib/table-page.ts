export const TABLE_PAGE_SIZE = 10

export function pageCount(total: number, pageSize = TABLE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

export function pageSlice<T>(
  items: T[],
  page: number,
  pageSize = TABLE_PAGE_SIZE
): T[] {
  const safePage = Math.min(Math.max(page, 1), pageCount(items.length, pageSize))
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function serialNumber(
  page: number,
  index: number,
  pageSize = TABLE_PAGE_SIZE
): number {
  return (page - 1) * pageSize + index + 1
}
