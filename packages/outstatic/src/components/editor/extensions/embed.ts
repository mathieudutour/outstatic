import { Node, mergeAttributes } from '@tiptap/core'

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>
  allowedDomains: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string }) => ReturnType
    }
  }
}

/**
 * Extracts a YouTube embed URL from various YouTube URL formats.
 * Returns null if the URL is not a valid YouTube URL.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace('www.', '')

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      // Already an embed URL
      if (parsed.pathname.startsWith('/embed/')) {
        return url
      }
      const videoId = parsed.searchParams.get('v')
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    if (hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1)
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Checks if a URL is from an allowed embed domain.
 */
export function isAllowedEmbedUrl(
  url: string,
  allowedDomains: string[]
): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace('www.', '')
    return allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

export const Embed = Node.create<EmbedOptions>({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      allowedDomains: [
        'youtube.com',
        'youtu.be',
        'youtube-nocookie.com',
        'vimeo.com',
        'loom.com'
      ]
    }
  },

  addAttributes() {
    return {
      src: {
        default: null
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src]'
      },
      {
        tag: 'div[data-embed]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          return { src: element.getAttribute('data-embed') }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'iframe',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        width: '100%',
        height: '400',
        frameborder: '0',
        allowfullscreen: 'true',
        allow:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        style:
          'border: 0; border-radius: 8px; aspect-ratio: 16/9; width: 100%; height: auto;'
      })
    ]
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const wrapper = document.createElement('div')
      wrapper.style.cssText =
        'position: relative; width: 100%; aspect-ratio: 16/9; margin: 1rem 0;'
      wrapper.setAttribute('data-embed', node.attrs.src || '')

      const iframe = document.createElement('iframe')
      const attrs = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          width: '100%',
          height: '100%',
          frameborder: '0',
          allowfullscreen: 'true',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          style: 'border: 0; border-radius: 8px; position: absolute; inset: 0;'
        }
      )
      for (const [key, value] of Object.entries(attrs)) {
        if (value !== null && value !== undefined) {
          iframe.setAttribute(key, value as string)
        }
      }

      wrapper.appendChild(iframe)

      return {
        dom: wrapper
      }
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          const src = node.attrs.src
          if (src) {
            state.write(
              `<iframe src="${src}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>\n\n`
            )
          }
        },
        parse: {
          // iframe HTML is parsed natively by the parseHTML method above
        }
      }
    }
  }
})
