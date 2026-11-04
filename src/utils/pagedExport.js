// Directory lists are fetched a page at a time, so exporting every match has
// to walk the same filtered query across all pages instead of shipping only
// the rows currently on screen.
export const EXPORT_PAGE_SIZE = 200;
export const MAX_EXPORT_RECORDS = 20000;

/**
 * @param {(cursor: { page: number, limit: number }) => Promise<{ records: any[], totalPages?: number }>} fetchPage
 */
export async function collectAllPages(
  fetchPage,
  { pageSize = EXPORT_PAGE_SIZE, maxRecords = MAX_EXPORT_RECORDS } = {}
) {
  const records = [];
  let page = 1;
  let truncated = false;

  for (;;) {
    const batchResponse = await fetchPage({ page, limit: pageSize });
    const batch = Array.isArray(batchResponse?.records) ? batchResponse.records : [];

    records.push(...batch);

    const totalPages = Number(batchResponse?.totalPages) || 1;

    if (batch.length === 0 || page >= totalPages) break;

    if (records.length >= maxRecords) {
      truncated = true;
      break;
    }

    page += 1;
  }

  return {
    records: truncated ? records.slice(0, maxRecords) : records,
    truncated,
  };
}
