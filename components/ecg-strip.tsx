const WIDTH = 200
const HEIGHT = 60
const BASELINE = 30
const AMPLITUDE = 22

// Build a smooth SVG path through points using a Catmull-Rom spline
// converted to cubic beziers. This rounds the waveform into flowing,
// sinusoidal curves instead of straight polyline segments.
function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return ""
  let d = `M ${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return d
}

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
  // map values to coordinates for one tile, offset so we can tile twice
  const tile = (offsetX: number): Array<[number, number]> =>
    data.map((v, i) => [(i / (n - 1)) * WIDTH + offsetX, BASELINE - v * AMPLITUDE])

  const points = [...tile(0), ...tile(WIDTH)]
  const d = smoothPath(points)

  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-800 px-2 py-1">
      <span className="absolute left-2 top-1 z-10 text-xs text-gray-500">ECG</span>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <line x1="0" y1={BASELINE} x2={WIDTH} y2={BASELINE} stroke="#374151" strokeWidth="1" />
        <g className="animate-ecg-scroll">
          <path d={d} stroke="#22C55E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}
