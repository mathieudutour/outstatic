import { useCallback, useState } from 'react'
import { Editor } from '@tiptap/core'
import { EditorBubbleButton } from '@/components/editor/ui/editor-bubble-button'
import { BubbleMenu } from '@tiptap/react'
import { getYouTubeEmbedUrl } from '@/components/editor/extensions/embed'

type EmbedMenuProps = {
  editor: Editor
}

const EmbedMenu = ({ editor }: EmbedMenuProps) => {
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [url, setUrl] = useState('')

  const shouldShow = useCallback(() => {
    return editor.isActive('embed')
  }, [editor])

  const removeEmbed = () => {
    editor.chain().focus().deleteSelection().run()
  }

  const updateUrl = useCallback(() => {
    const embedUrl = getYouTubeEmbedUrl(url)
    if (embedUrl) {
      editor.chain().focus().updateAttributes('embed', { src: embedUrl }).run()
      setShowUrlInput(false)
      setUrl('')
    }
  }, [editor, url])

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        maxWidth: 500
      }}
    >
      <div className="flex rounded-md border border-muted bg-background shadow-md transition-all">
        {showUrlInput ? (
          <>
            <EditorBubbleButton
              onClick={() => setShowUrlInput(false)}
              name="back"
            >
              <p className="text-base">←</p>
            </EditorBubbleButton>
            <input
              className="w-[300px] border-r border-muted px-3 outline-hidden"
              placeholder="Paste a YouTube URL"
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateUrl()
                if (e.key === 'Escape') setShowUrlInput(false)
              }}
              defaultValue={url}
              autoFocus
            />
            <EditorBubbleButton onClick={updateUrl} name="done">
              Done
            </EditorBubbleButton>
          </>
        ) : (
          <>
            <EditorBubbleButton
              onClick={() => {
                const src = editor.getAttributes('embed').src || ''
                setUrl(src)
                setShowUrlInput(true)
              }}
              name="edit-embed"
            >
              Edit URL
            </EditorBubbleButton>
            <EditorBubbleButton onClick={removeEmbed} name="remove-embed">
              Remove
            </EditorBubbleButton>
          </>
        )}
      </div>
    </BubbleMenu>
  )
}

export default EmbedMenu
