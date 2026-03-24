import { Editor, Range } from '@tiptap/react'
import { Check } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getYouTubeEmbedUrl } from '@/components/editor/extensions/embed'
import { Button } from '@/components/ui/shadcn/button'

type EmbedCommandListProps = {
  editor: Editor
  setEmbedMenu: (value: boolean) => void
  range: Range
}

export const EmbedCommandList = ({
  editor,
  range,
  setEmbedMenu
}: EmbedCommandListProps) => {
  const [embedUrl, setEmbedUrl] = useState('')
  const [error, setError] = useState('')

  const insertEmbed = useCallback(
    (url: string) => {
      const youtubeUrl = getYouTubeEmbedUrl(url)

      if (!youtubeUrl) {
        setError('Please enter a valid YouTube URL')
        return
      }

      editor.chain().focus().deleteRange(range).run()
      editor.chain().focus().setEmbed({ src: youtubeUrl }).run()
    },
    [editor, range]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        insertEmbed(embedUrl)
        return true
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setEmbedMenu(false)
        editor.chain().focus().run()
        return true
      }
      return false
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [embedUrl, insertEmbed, setEmbedMenu, editor])

  useEffect(() => {
    editor.chain().blur().run()
  }, [editor])

  return (
    <div id="outstatic">
      <div className="flex z-50 w-96 rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden p-1">
        <input
          type="text"
          className={`flex-1 bg-background p-1 text-sm outline-hidden ${
            error ? 'bg-red-50' : 'bg-background'
          }`}
          placeholder="Paste a YouTube URL"
          onChange={(e) => setEmbedUrl(e.target.value)}
          value={embedUrl}
          onFocus={() => setError('')}
          autoFocus
        />
        {error && (
          <span className="absolute text-red-500 top-10 left-0 text-xs">
            {error}
          </span>
        )}
        <Button
          onClick={() => insertEmbed(embedUrl)}
          size="icon"
          className="h-8"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
