'use client'

import { LogOut, UserRoundCog } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ShopAuthContextType } from '@/contexts/shop-auth-context'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

export function UserMenu({ user, signOut, fantasyName }: Partial<ShopAuthContextType> & { fantasyName?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false)

  const onLogoutAlertClose = () => setIsLogoutAlertOpen(false)

  const handleSignOut = async () => {
    signOut?.()
    toast({
      title: 'Sessão encerrada com sucesso!',
      status: 'success'
    })
    router.refresh()
  }

  const handleAccountManagement = () => {
    router.push(`/shop/${encodeURIComponent(fantasyName ?? '')}/account`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='relative flex min-h-11 min-w-11 overflow-hidden rounded-full text-primary'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='truncate w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{user?.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAccountManagement}>
            <UserRoundCog className='mr-2 h-4 w-4' />
            <span>Gestão da Conta</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsLogoutAlertOpen(true)} className='text-danger-foreground'>
            <LogOut className='mr-2 h-4 w-4' />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isLogoutAlertOpen ? (
        <Dialog open={isLogoutAlertOpen} onOpenChange={onLogoutAlertClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sair da conta</DialogTitle>
              <DialogDescription>
                Deseja mesmo <b>sair da sua conta</b>?
              </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-end gap-3'>
              <Button type='button' variant='secondary' onClick={onLogoutAlertClose}>
                Cancelar
              </Button>
              <Button variant='destructive' onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
