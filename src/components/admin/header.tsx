import { Company } from '@/interfaces/company.interface'
import { Dispatch, SetStateAction } from 'react'
import SideBar from './side-bar'

interface HeaderProps {
  company?: Company
  isSidebarOpen: boolean
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>
}

export function Header({ company, isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  return (
    <div className='xl:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center px-4 z-50'>
      <SideBar.Toggle isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <h1 className='text-lg font-bold text-green-950 ml-4 truncate'>{company?.fantasyName || 'Sellou'}</h1>
    </div>
  )
}
