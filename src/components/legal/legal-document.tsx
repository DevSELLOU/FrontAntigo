import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

export interface LegalSection {
  /** Anchor target. Kept in Portuguese so a shared link reads as what it points at. */
  id: string
  title: string
  body: ReactNode
}

interface LegalDocumentProps {
  eyebrow: string
  title: string
  /** One paragraph under the title — what this document is, in plain words. */
  intro: string
  /** Human date, e.g. "19 de agosto de 2026". */
  updatedAt: string
  /** Optional banner above the table of contents (used for the "draft" warning). */
  notice?: ReactNode
  sections: LegalSection[]
  related: { href: string; label: string }
}

/**
 * Shell shared by `/privacy-policy` and `/terms`.
 *
 * These are the only two pages of the product a person reads *as a text* rather than operates, so
 * they get long-form treatment instead of the app's UI scale: 17px body, 1.75 line height and a
 * column capped near 70 characters. Everything else — colour, border, surface — comes from the same
 * tokens as the rest of the platform, so both themes work without a second palette.
 *
 * `h-screen overflow-y-auto` is not decoration: `app/layout.tsx` locks `body` with
 * `overflow-hidden`, so a full-page screen has to carry its own scroll (design.md §12.1).
 */
export function LegalDocument({ eyebrow, title, intro, updatedAt, notice, sections, related }: LegalDocumentProps) {
  return (
    <div className='h-screen overflow-y-auto bg-app'>
      {/* `code` is styled once here rather than at every call site: these documents name a bucket,
          a cookie and a domain, and each of those reads wrong as running text. */}
      <div className='mx-auto w-full max-w-[38rem] px-5 pb-24 pt-6 sm:px-6 sm:pt-10 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]'>
        <Link
          href='/'
          className='-ml-2 inline-flex h-11 items-center gap-2 rounded-md px-2 text-label text-text-muted transition-colors hover:text-text'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          Voltar para a Sellou
        </Link>

        <header className='mt-4'>
          <p className='text-eyebrow uppercase text-text-muted'>{eyebrow}</p>
          <h1 className='mt-2 text-h1 text-text'>{title}</h1>
          <p className='mt-3 text-[17px] leading-[1.75] text-text-body'>{intro}</p>
          <p className='mt-4 text-caption text-text-muted'>Última atualização: {updatedAt}</p>
        </header>

        {notice && <div className='mt-6'>{notice}</div>}

        <nav aria-labelledby='sumario' className='mt-8 rounded-lg border border-border bg-surface-muted p-4 sm:p-5'>
          <h2 id='sumario' className='text-label text-text'>
            Nesta página
          </h2>

          <ol className='mt-1 flex flex-col'>
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className='flex min-h-[44px] items-center gap-3 rounded-md py-1 text-[15px] leading-snug text-text-body transition-colors hover:text-text'
                >
                  <span className='w-5 shrink-0 text-right text-caption tabular-nums text-text-muted'>{index + 1}.</span>
                  <span className='min-w-0'>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className='mt-10 flex flex-col gap-10'>
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className='scroll-mt-6'>
              <h2 className='text-h2 text-text'>
                <span className='text-text-muted'>{index + 1}. </span>
                {section.title}
              </h2>

              <div className='mt-3 flex flex-col gap-4 text-[17px] leading-[1.75] text-text-body'>{section.body}</div>
            </section>
          ))}
        </div>

        <footer className='mt-14 flex flex-col gap-3 border-t border-border pt-6'>
          <Link
            href={related.href}
            className='inline-flex min-h-[44px] items-center gap-2 text-label text-primary hover:underline'
          >
            {related.label}
            <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
          </Link>

          <a href='#sumario' className='inline-flex min-h-[44px] items-center text-label text-text-muted hover:text-text'>
            Voltar ao início da página
          </a>
        </footer>
      </div>
    </div>
  )
}

/**
 * Marks a fact that nobody has confirmed yet. Deliberately loud: a placeholder that reads like
 * finished text is how a wrong statement gets published.
 */
export function ToDefine({ children }: { children: ReactNode }) {
  return (
    // `box-decoration-clone` so a marker that wraps keeps its box on every line instead of
    // breaking into open-ended fragments.
    <span className='box-decoration-clone rounded border border-warning-border bg-warning px-1.5 py-0.5 text-[15px] font-semibold leading-[2] text-warning-foreground'>
      [A DEFINIR: {children}]
    </span>
  )
}

/** A block of the document that is a list of named items (cookies, subprocessors, purposes). */
export function LegalItem({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className='rounded-lg border border-border bg-surface p-4'>
      <p className='text-label text-text'>{term}</p>
      <div className='mt-1 flex flex-col gap-2 text-[15px] leading-[1.6] text-text-body'>{children}</div>
    </div>
  )
}

/** Bulleted list with the document's reading rhythm. */
export function LegalList({ children }: { children: ReactNode }) {
  return <ul className='ml-5 flex list-disc flex-col gap-2 marker:text-text-muted'>{children}</ul>
}
