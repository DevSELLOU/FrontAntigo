'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { clientFetch } from '@/utils/client-fetch.util'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

export function ImportPaymentConditionsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importMode, setImportMode] = useState<'create' | 'update'>('create')
  const router = useRouter()
  const params = useParams()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleDownloadTemplate = () => {
    const headers = ['nome', 'descricao']
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(';') + '\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'modelo-importacao-condicoes-pagamento.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async () => {
    const companyId = params.companyId

    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo CSV para importar.')
      return
    }

    setIsImporting(true)
    const formData = new FormData()
    formData.append('mode', importMode)
    formData.append('file', selectedFile)
    try {
      await clientFetch(`/company/${companyId}/payment-condition/import`, {
        method: 'POST',
        body: formData
      })

      toast.success('Condições de pagamento importadas com sucesso.')
      setIsOpen(false)
      router.refresh()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao importar as condições de pagamento. Verifique o formato do arquivo.'
      toast.error(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Importar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Condições de Pagamento</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar condições de pagamento. Certifique-se que o arquivo
            segue o formato esperado.
          </DialogDescription>
        </DialogHeader>
        <div className='text-sm'>
          Não tem certeza do formato?{' '}
          <Button variant='link' className='p-0 h-auto' onClick={handleDownloadTemplate}>
            Faça o download do modelo.
          </Button>
        </div>
        <RadioGroup defaultValue='create' onValueChange={(value: 'create' | 'update') => setImportMode(value)}>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='create' id='mode-create' />
            <Label htmlFor='mode-create'>Criar novas condições</Label>
          </div>
          <p className='text-xs text-muted-foreground pl-6'>
            Adiciona apenas condições de pagamento novas.
          </p>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='update' id='mode-update' />
            <Label htmlFor='mode-update'>Atualizar condições existentes</Label>
          </div>
          <p className='text-xs text-muted-foreground pl-6'>
            Atualiza condições existentes com base no nome.
          </p>
        </RadioGroup>

        <div className='grid w-full max-w-sm items-center gap-1.5'>
          <Label htmlFor='csv-file'>Arquivo CSV</Label>
          <Input id='csv-file' type='file' accept='.csv' onChange={handleFileChange} />
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => setIsOpen(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !selectedFile}>
            {isImporting ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
