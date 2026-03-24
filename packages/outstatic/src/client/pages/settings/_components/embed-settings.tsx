import { useGetConfig } from '@/utils/hooks/use-get-config'
import { useUpdateConfig } from '@/utils/hooks/use-update-config'
import { Button } from '@/components/ui/shadcn/button'
import { Label } from '@/components/ui/shadcn/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/shadcn/select'
import { useState, useMemo } from 'react'
import { Skeleton } from '@/components/ui/shadcn/skeleton'

export function EmbedSettings() {
  const [loading, setLoading] = useState(false)
  const { data: config, isPending } = useGetConfig()
  const [localEnabled, setLocalEnabled] = useState<string | null>(null)

  const onSubmit = useUpdateConfig({ setLoading })

  const selectedValue = useMemo(() => {
    if (localEnabled !== null) return localEnabled
    return config?.enableEmbeds ? 'enabled' : 'disabled'
  }, [localEnabled, config?.enableEmbeds])

  const hasChanges = useMemo(() => {
    if (localEnabled === null) return false
    const currentValue = config?.enableEmbeds ? 'enabled' : 'disabled'
    return localEnabled !== currentValue
  }, [localEnabled, config?.enableEmbeds])

  const handleSave = () => {
    onSubmit({
      configFields: { enableEmbeds: selectedValue === 'enabled' },
      callbackFunction: () => {
        setLocalEnabled(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="enableEmbeds">Embeds</Label>
        {isPending ? (
          <Skeleton className="w-full h-10" />
        ) : (
          <Select value={selectedValue} onValueChange={setLocalEnabled}>
            <SelectTrigger id="enableEmbeds" className="w-full">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
            </SelectContent>
          </Select>
        )}
        <p className="text-sm text-muted-foreground">
          Allow embedding YouTube videos in documents. When enabled, a new
          &quot;Embed&quot; option appears in the editor&apos;s slash command
          menu. Embeds are stored as iframes and need to be handled when
          rendering on your site.
        </p>
      </div>
      <Button disabled={loading || !hasChanges} onClick={handleSave}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
