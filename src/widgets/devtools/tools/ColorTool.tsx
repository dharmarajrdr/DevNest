import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function ColorTool() {
  const [hex, setHex] = useState('#5B8CFF')

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : null), [rgb])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ToolField label="Hex">
          <ToolTextarea value={hex} onChange={setHex} rows={1} error={!rgb} />
        </ToolField>
        <div
          className="mt-4 h-9 w-9 shrink-0 rounded-lg border border-border"
          style={{ backgroundColor: rgb ? hex : 'transparent' }}
        />
      </div>
      {rgb && hsl ? (
        <>
          <ToolField label="RGB" action={<CopyIconButton value={`rgb(${rgb.join(', ')})`} />}>
            <ToolTextarea value={`rgb(${rgb.join(', ')})`} readOnly rows={1} />
          </ToolField>
          <ToolField label="HSL" action={<CopyIconButton value={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} />}>
            <ToolTextarea value={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} readOnly rows={1} />
          </ToolField>
        </>
      ) : (
        <p className="text-xs text-danger">Enter a valid 6-digit hex color, e.g. #5B8CFF.</p>
      )}
    </div>
  )
}
