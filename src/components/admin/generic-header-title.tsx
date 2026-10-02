'use client'

export function GenericHeaderTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <h1 className='text-h1 text-text'>{title}</h1>
      <p className='text-body text-text-muted hidden xl:block'>{description}</p>
    </div>
  )
}
