import { ReportScreenSkeleton } from '@/components/reports/report-blocks'

/**
 * Covers the four report routes. They all `await serverFetch` at the top of the page, so without
 * this the browser sat on the previous screen for the whole query with no sign the click had
 * registered — the most repeated moment on the surface, and the one that had no design.
 */
export default function ReportsLoading() {
  return <ReportScreenSkeleton />
}
