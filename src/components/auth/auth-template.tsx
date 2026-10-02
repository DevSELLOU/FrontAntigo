import type { ReactNode } from 'react'

interface AuthTemplateProps {
  children: ReactNode
}

export default function AuthTemplate({ children }: AuthTemplateProps) {
  return (
    <main className='min-h-screen w-full flex bg-app'>
      {/* Left side — gradient + value props */}
      <aside className='hidden lg:flex lg:w-1/2 flex-col justify-end p-10 relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-600'>
        {/* Frosted glass accent */}
        <div className='absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl bg-white/30 -mr-48 -mt-48' />

        {/* Content */}
        <div className='relative z-10 space-y-12'>
          {/* Logo symbol */}
          <div className='inline-flex items-center justify-center h-12 w-12 rounded-lg bg-white/10 backdrop-blur-md border border-white/20'>
            <span className='text-white font-bold text-lg'>S</span>
          </div>

          {/* Main heading */}
          <h1 className='text-display text-white font-bold leading-tight'>
            Gerencie suas vendas com inteligência
          </h1>

          {/* Value props */}
          <div className='space-y-4'>
            <div className='flex gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-300/20 text-brand-100'>
                ✓
              </div>
              <p className='text-body text-white/80'>
                Automação completa do ciclo de vendas
              </p>
            </div>
            <div className='flex gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-300/20 text-brand-100'>
                ✓
              </div>
              <p className='text-body text-white/80'>
                Insights em tempo real com IA integrada
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right side — sign-in form */}
      <div className='flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10'>
        <div className='w-full max-w-sm'>{children}</div>
      </div>
    </main>
  )
}
