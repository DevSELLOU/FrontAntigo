'use client'

import DOMPurify from 'dompurify'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Heading from '@tiptap/extension-heading'
import Italic from '@tiptap/extension-italic'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, StrikethroughIcon, UnderlineIcon } from 'lucide-react'
import type React from 'react'

import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MenuButton = ({
  onClick,
  active,
  children,
  label
}: {
  onClick: () => void
  active: boolean
  children: React.ReactNode
  label: string
}) => (
  <button
    type='button'
    onClick={onClick}
    aria-label={label}
    title={label}
    className={cn(
      'h-8 w-8 rounded-md flex items-center justify-center transition-colors',
      active
        ? 'bg-gray-200 text-gray-900'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    )}
  >
    {children}
  </button>
)

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        strike: false
      }),
      Bold,
      Italic,
      Strike,
      Underline,
      Heading.configure({ levels: [2, 3] }),
      BulletList,
      OrderedList,
      ListItem
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : DOMPurify.sanitize(html))
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] px-3 py-2 focus:outline-none'
      }
    }
  })

  if (!editor) {
    return (
      <div className='border rounded-md min-h-[200px] bg-gray-50 animate-pulse' />
    )
  }

  return (
    <div className='border rounded-md overflow-hidden'>
      <div className='flex items-center gap-1 px-2 py-1.5 border-b bg-gray-50'>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label='Negrito'
        >
          <BoldIcon className='h-4 w-4' />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label='Itálico'
        >
          <ItalicIcon className='h-4 w-4' />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          label='Sublinhado'
        >
          <UnderlineIcon className='h-4 w-4' />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          label='Riscado'
        >
          <StrikethroughIcon className='h-4 w-4' />
        </MenuButton>
        <span className='w-px h-6 bg-gray-300 mx-1' />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label='Título'
        >
          <span className='text-xs font-bold'>H2</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          label='Subtítulo'
        >
          <span className='text-xs font-bold'>H3</span>
        </MenuButton>
        <span className='w-px h-6 bg-gray-300 mx-1' />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label='Lista'
        >
          <ListIcon className='h-4 w-4' />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          label='Lista numerada'
        >
          <ListOrderedIcon className='h-4 w-4' />
        </MenuButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
