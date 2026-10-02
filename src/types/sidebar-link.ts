export interface SideBarLink {
  text: string
  href: string
  icon: React.ReactNode
  isExternal?: boolean
  items?: Omit<SideBarLink, 'icon' | 'items'>[]
}
