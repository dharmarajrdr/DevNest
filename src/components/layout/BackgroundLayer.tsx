import { useSettingsStore } from '@/store/useSettingsStore'

/** Renders the optional background image with overlay/blur, or nothing. */
export function BackgroundLayer() {
  const { settings } = useSettingsStore()
  const { background } = settings

  if (!background.enabled || !background.imageUrl) return null

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${background.imageUrl})`,
          opacity: background.opacity,
          filter: background.blurPx ? `blur(${background.blurPx}px)` : undefined,
        }}
      />
      <div
        className="absolute inset-0 bg-bg"
        style={{ opacity: background.overlayIntensity }}
      />
    </div>
  )
}
