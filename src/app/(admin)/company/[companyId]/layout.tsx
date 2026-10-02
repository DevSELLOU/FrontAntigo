'use client'

import { Header } from '@/components/admin/header'
import { MobileFooterMenu } from '@/components/admin/mobile-footer-menu'
import { NonAuthorizedPage } from '@/components/admin/non-authorized-page'
import SideBar from '@/components/admin/side-bar'
import { Topbar } from '@/components/admin/topbar'
import { ScreenLoading } from '@/components/ui/screen-loading'
import { isUserRole } from '@/enums/user-role.enum'
import { useAuth } from '@/hooks/use-auth'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { SideBarLink } from '@/types/sidebar-link'
import { clientFetch } from '@/utils/client-fetch.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { setCustomColor } from '@/utils/set-custom-color.util'
import {
ChartBar,
  Clipboard,
  Cog,
  Contact,
  FileChartColumnIncreasing,
  MapPin,
  Package,
  Settings,
  Store,
  Target,
  TrendingUp,
  UserRound
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { notFound, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  params: {
    companyId: number
  }
}

export default function CompanyLayout({ children, params }: LayoutProps) {
  const pathname = usePathname()
  const { companyId } = params
  const { user, role, isAdministrator, companies, activeCompanyId, isLoading: isAuthLoading } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [isCompanyLoading, setIsCompanyLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const loggedUser = isUserRole(role)

  useEffect(() => {
    if (isAuthLoading) return

    if (!loggedUser) return

    const fetchCompanyData = async () => {
      if (!user) {
        setIsCompanyLoading(false)
        return
      }

      try {
        const url = `/company/${companyId}`
        const response = await clientFetch<CommonResponse<Company>>(
          url,
          { method: 'GET' },
          {
            handleTokenExpired: signOut
          }
        )

        if (isApiErrorResponse(response)) {
          throw new Error(response.message)
        }

        if (response?.data?.customColor) {
          setCustomColor(response.data.customColor)
        }

        setCompany(response.data)
      } catch (error) {
        console.error('Failed to fetch company data:', error)
      } finally {
        setIsCompanyLoading(false)
      }
    }

    fetchCompanyData()
  }, [companyId, user, loggedUser])

  // Os três useMemo abaixo ficavam DEPOIS dos dois early returns logo adiante. Isso viola as
  // regras de hooks: enquanto `isAuthLoading` era true o componente registrava N hooks, e no
  // render em que virava false apareciam 3 a mais — React quebra com "Rendered more hooks than
  // during the previous render". Nunca dependeram de nada calculado depois das guardas, então
  // subir é movimento puro. Encontrado pelo ESLint assim que o lint voltou a rodar.
  const links: SideBarLink[] = useMemo(
    () => [
      { href: `/company/${companyId}/dashboard`, text: 'Dashboard', icon: <ChartBar size={18} /> },
      { href: `/company/${companyId}/products`, text: 'Produtos', icon: <Package size={18} /> },
      { href: `/company/${companyId}/orders`, text: 'Pedidos', icon: <Clipboard size={18} /> },
      { href: `/company/${companyId}/customers`, text: 'Clientes', icon: <Contact size={18} /> },
      ...(!isAdministrator
        ? [
            {
              href: `/company/${companyId}/my-goals`,
              text: 'Minhas Metas',
              icon: <TrendingUp size={18} />
            },
            { href: `/company/${companyId}/my-routes`, text: 'Minhas Rotas', icon: <MapPin size={18} /> }
          ]
        : []),
      ...(isAdministrator
        ? [
            {
              text: 'Gerenciamento',
              href: '#',
              icon: <Cog size={18} />,
              items: [
                // Seven screens became tabs of this single hub: Categorias, Segmentos, Condições e
                // Métodos de pagamento, Usuários, Prazos de pedido and Preferências.
                { href: `/company/${companyId}/settings`, text: 'Configurações', icon: <Settings size={18} /> },
                { href: `/company/${companyId}/hierarchy`, text: 'Hierarquia' },
                { href: `/company/${companyId}/goals`, text: 'Metas', icon: <Target size={16} /> },
                {
                  href: `/company/${companyId}/access-requests`,
                  text: 'Requisições de Acesso'
                },
                { href: `/company/${companyId}/routes`, text: 'Rotas' },
                { href: `/company/${companyId}/price-tables`, text: 'Tabelas de Preço' }
              ]
            }
          ]
        : []),
      {
        text: 'Relatórios',
        href: '#',
        icon: <FileChartColumnIncreasing size={18} />,
        items: [
          { href: `/company/${companyId}/reports/orders-summary`, text: 'Pedidos' },
          { href: `/company/${companyId}/reports/sales`, text: 'Vendas' },
          { href: `/company/${companyId}/reports/products`, text: 'Produtos' },
          { href: `/company/${companyId}/reports/custom`, text: 'Relatório Personalizável' },
        ]
      },
      // Every role, not just the sales rep: the avatar menu that also leads here is `hidden xl:flex`,
      // so on a phone the sidebar is the only way anyone reaches their own password.
      { href: `/company/${companyId}/profile`, text: 'Meu perfil', icon: <UserRound size={18} /> },
      { href: `/shop/${encodeURIComponent(company?.fantasyName ?? '')}`, text: 'Minha Loja', icon: <Store size={18} />, isExternal: true }
    ],
    [companyId, isAdministrator, company?.fantasyName]
  )

  const filteredLinks = useMemo(() => (loggedUser ? links : []), [loggedUser, links])

  const currentPageLabel = useMemo(() => {
    for (const link of filteredLinks) {
      if (link.items) {
        const child = link.items.find(item => pathname.startsWith(item.href))
        if (child) return child.text
      } else if (link.href !== '#' && pathname.startsWith(link.href)) {
        return link.text
      }
    }
    return ''
  }, [filteredLinks, pathname])


  if (isAuthLoading) {
    return <ScreenLoading />
  }

  if (!loggedUser) {
    return <NonAuthorizedPage />
  }

  if (isCompanyLoading) {
    return <ScreenLoading />
  }

  if (!company) {
    notFound()
  }

  return (
    <main className='flex flex-col xl:flex-row h-screen min-h-screen'>
      <Header company={company} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className='flex flex-col xl:flex-row w-full flex-1 h-full pt-16 xl:pt-0'>
        <SideBar
          links={filteredLinks}
          company={company}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          companies={companies}
          activeCompanyId={activeCompanyId}
        />
        <div className='flex flex-col w-full min-w-0 h-full overflow-auto lg:pb-0 pb-16'>
          <Topbar company={company.fantasyName} page={currentPageLabel} />
          {children}
        </div>
      </div>

      <MobileFooterMenu companyId={companyId} />
    </main>
  )
}
