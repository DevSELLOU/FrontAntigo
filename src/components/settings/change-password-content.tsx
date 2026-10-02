import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ChangePassswordForm } from './change-password-form'

export function ChangePasswordContent({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
        <CardDescription>
          Escolha uma nova senha de acesso. A senha atual é pedida para confirmar que é você.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <ChangePassswordForm />
      </CardContent>
    </Card>
  )
}
