type GaugeProps = {
  current: number
  total: number
}

export function Gauge({ current, total }: GaugeProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="gauge">
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="gauge-readout">
        {current}/{total} <span className="gauge-readout-percent">· {percent}%</span>
      </span>
    </div>
  )
}
