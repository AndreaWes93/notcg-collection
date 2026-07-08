export type SignalColor = 'amber' | 'red' | 'green' | 'slate'

const SIGNAL_COLORS: SignalColor[] = ['amber', 'red', 'green', 'slate']

export function channelColorForId(id: string): SignalColor {
  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return SIGNAL_COLORS[hash % SIGNAL_COLORS.length]
}

type SignalDotProps = {
  color?: SignalColor
  pulse?: boolean
}

export function SignalDot({ color = 'amber', pulse = false }: SignalDotProps) {
  return (
    <span
      className={`led-dot ${color !== 'amber' ? `led-dot-${color}` : ''} ${pulse ? 'led-dot-pulse' : ''}`}
      aria-hidden="true"
    />
  )
}
