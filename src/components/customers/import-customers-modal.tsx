'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { clientFetch } from '@/utils/client-fetch.util'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface ImportCustomersModalProps {
  companyId: number
  isOpen: boolean
  onClose: () => void
}

export function ImportCustomersModal({ companyId, isOpen, onClose }: ImportCustomersModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'create' | 'update'>('create')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo CSV para importar.')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('mode', mode)

    try {
      await clientFetch(`/company/${companyId}/customer/import`, {
        method: 'POST',
        body: formData
      })

      toast.success('Clientes importados com sucesso.')
      onClose()
      router.refresh()
    } catch (error: any) {
      console.error('Failed to fetch customer importdata:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao importar os clientes. Verifique o formato do arquivo.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'razaoSocial',
      'nomeFantasia',
      'cpfCnpj',
      'cep',
      'endereco',
      'cidade',
      'uf',
      'bairro',
      'telefone',
      'email',
      'limiteCredito',
      'inscricaoEstadual',
      'gln',
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(';') + '\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'modelo_importacao_clientes.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Clientes</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar novos clientes. Certifique-se que o arquivo
            segue o formato esperado.
          </DialogDescription>
        </DialogHeader>
        <div className='text-sm'>
          Não tem certeza do formato?{' '}
          <Button variant='link' className='p-0 h-auto' onClick={handleDownloadTemplate}>
            Faça o download do modelo.
          </Button>
        </div>

        <RadioGroup defaultValue='create' onValueChange={(value: 'create' | 'update') => setMode(value)}>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='create' id='mode-create' />
            <Label htmlFor='mode-create'>Criar novos clientes</Label>
          </div>
          <p className='text-xs text-muted-foreground pl-6'>
            Adiciona apenas clientes novos ao sistema (ignora duplicados).
          </p>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='update' id='mode-update' />
            <Label htmlFor='mode-update'>Atualizar clientes existentes</Label>
          </div>
          <p className='text-xs text-muted-foreground pl-6'>
            Atualiza clientes existentes com base no CPF/CNPJ.
          </p>
        </RadioGroup>

        <div className='grid w-full max-w-sm items-center gap-1.5'>
          <Label htmlFor='csv-file'>Arquivo CSV</Label>
          <Input id='csv-file' type='file' accept='.csv' onChange={handleFileChange} />
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !selectedFile}>
            {isLoading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
