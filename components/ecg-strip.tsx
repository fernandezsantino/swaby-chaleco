const WIDTH = 200
const HEIGHT = 60
const BASELINE = 32
const AMPLITUDE = 17

// Build a smooth SVG path through the points using a Catmull-Rom -> cubic bezier
// conversion, so the trace renders as flowing curves instead of straight segments.
function smoothPath(values: number[], offsetX: number): string {
  const n = values.length
  const pts = values.map((v, i) => ({
    x: (i / (n - 1)) * WIDTH + offsetX,
    y: BASELINE - v * AMPLITUDE,
  }))

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

export function EcgStrip({ data, connected }: { data: number[]; connected: boolean }) {
  if (!connected) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-[#04141a] px-2 py-1">
        <span className="absolute left-2 top-1 text-xs text-gray-500">ECG</span>
        <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
          <line x1="0" y1={BASELINE} x2={WIDTH} y2={BASELINE} stroke="#1f3b42" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm text-gray-600">-- --</span>
      </div>
    )
  }

  // tile the path twice so the scroll animation loops seamlessly
  const path = `${smoothPath(data, 0)} ${smoothPath(data, WIDTH)}`

  return (
    <div className="relative overflow-hidden rounded-lg bg-[#04141a] px-2 py-1">
      <span className="absolute left-2 top-1 z-10 text-xs text-teal-600">ECG</span>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <defs>
          <filter id="ecg-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="animate-ecg-scroll" filter="url(#ecg-glow)">
          <path d={path} stroke="#2dd4bf" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}
