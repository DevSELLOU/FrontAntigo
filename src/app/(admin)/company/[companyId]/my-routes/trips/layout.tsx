/** Page shell for the trip execution screens. The page itself renders only content —
 *  before, both this layout and the page painted the same padded container, so every
 *  block sat inside a doubled gutter. */
export default function TripsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>{children}</div>
  )
}
