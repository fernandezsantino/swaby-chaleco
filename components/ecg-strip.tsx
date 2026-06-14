const WIDTH = 200
const HEIGHT = 60
const BASELINE = 30
const AMPLITUDE = 22

export function EcgStrip({ data, connected }: { data: number[]; connected: boolean }) {
  if (!connected) {
    return (
      <div className="relative rounded-lg bg-gray-800 px-2 py-1">
        <span className="absolute left-2 top-1 text-xs text-gray-500">ECG</span>
        <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
          <line x1="0" y1={BASELINE} x2={WIDTH} y2={BASELINE} stroke="#374151" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm text-gray-600">-- --</span>
      </div>
    )
  }

  const n = data.length
  // map each value to coordinates; tile twice so the scroll animation loops seamlessly
  const toPoints = (offsetX: number) =>
    data
      .map((v, i) => {
        const x = (i / (n - 1)) * WIDTH + offsetX
        const y = BASELINE - v * AMPLITUDE
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

  const points = `${toPoints(0)} ${toPoints(WIDTH)}`

  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-800 px-2 py-1">
      <span className="absolute left-2 top-1 z-10 text-xs text-gray-500">ECG</span>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <line x1="0" y1={BASELINE} x2={WIDTH} y2={BASELINE} stroke="#374151" strokeWidth="1" />
        <g className="animate-ecg-scroll">
          <polyline points={points} stroke="#22C55E" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </div>
  )
}
