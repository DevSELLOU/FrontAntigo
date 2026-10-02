import { Company } from '@/interfaces/company.interface'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CompanyPreferencesForm } from './company-preferences-form'

export function CompanyPreferencesContent({ company, className }: { company: Company; className?: string }) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle>Customização</CardTitle>
        <CardDescription>Personalize a sua empresa.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-2 h-full'>
        <CompanyPreferencesForm company={company} />
      </CardContent>
    </Card>
  )
}
