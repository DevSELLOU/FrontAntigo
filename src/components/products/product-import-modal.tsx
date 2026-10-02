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
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

type ImportMode = 'create' | 'update'

interface ProductImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProductImportModal = ({ isOpen, onClose }: ProductImportModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importMode, setImportMode] = useState<ImportMode>('create')
  const router = useRouter()
  const params = useParams()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'nome',
      'descricao',
      'preco',
      'ncm',
      'cores',
      'marca',
      'unidadeDeMedida',
      'altura',
      'comprimento',
      'largura',
      'pesoLiquido',
      'espessura',
      'referencia',
      'modelo',
      'estoque',
      'ipi',
      'st',
      'codigoDeBarras',
      'fabricante',
      'icms',
      'codigoCliente'
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(';') + '\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'modelo-importacao-produtos.csv')
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
      await clientFetch(`/company/${companyId}/products/import`, {
        method: 'POST',
        body: formData
      })

      toast.success('Produtos importados com sucesso.')
      onClose()
      router.refresh()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao importar os produtos. Verifique o formato do arquivo.'
      toast.error(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Produtos</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar novos produtos. Certifique-se que o arquivo
            segue o formato esperado.
          </DialogDescription>
        </DialogHeader>
        <div className='text-sm'>
          Não tem certeza do formato?{' '}
          <Button variant='link' className='p-0 h-auto' onClick={handleDownloadTemplate}>
            Faça o download do modelo.
          </Button>
        </div>
        <RadioGroup defaultValue='create' onValueChange={(value: ImportMode) => setImportMode(value)}>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='create' id='mode-create' />
            <Label htmlFor='mode-create'>Criar novos produtos</Label>
          </div>
          <p className='text-xs text-muted-foreground pl-6'>
            Adiciona apenas produtos novos ao sistema.
          </p>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='update' id='mode-update' />
            <Label htmlFor='mode-update'>Atualizar produtos existentes</Label>
          </div>
          <p className='text-xs text-muted-foreground pl-6'>
            Atualiza produtos existentes com base na coluna &apos;referencia&apos;. O &apos;codigoCliente&apos; não será alterado.
          </p>
        </RadioGroup>

        <div className='grid w-full max-w-sm items-center gap-1.5'>
          <Label htmlFor='csv-file'>Arquivo CSV</Label>
          <Input id='csv-file' type='file' accept='.csv' onChange={handleFileChange} />
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={onClose} disabled={isImporting}>
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