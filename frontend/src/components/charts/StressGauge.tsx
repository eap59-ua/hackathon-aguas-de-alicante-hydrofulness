/**
 * StressGauge.tsx — Gauge semicircular SVG para el Índice de Estrés Hídrico.
 */

import { useEffect, useState } from 'react'

interface Props {
  value: number   // 0 to 2
  maxValue?: number
}

const SECTIONS = [
  { label: 'BAJO', color: '#10B981', max: 0.7 },
  { label: 'MODERADO', color: '#F59E0B', max: 1.0 },
  { label: 'ALTO', color: '#FB923C', max: 1.3 },
  { label: 'CRÍTICO', color: '#EF4444', max: 2.0 },
]

export default function StressGauge({ value, maxValue = 2 }: Props) {
  const [animatedAngle, setAnimatedAngle] = useState(0)

  const clampedValue = Math.min(Math.max(value, 0), maxValue)
  const targetAngle = (clampedValue / maxValue) * 180

  useEffect(() => {
    const start = performance.now()
    const duration = 1500
    const animate = (now: number) => {
      const prog = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - prog, 3) // ease-out
      setAnimatedAngle(targetAngle * eased)
      if (prog < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [targetAngle])

  const level = SECTIONS.find((s) => clampedValue <= s.max) || SECTIONS[3]

  const cx = 120, cy = 110, outerR = 90, innerR = 60
  const arcPath = (startFrac: number, endFrac: number) => {
    const sA = Math.PI + startFrac * Math.PI
    const eA = Math.PI + endFrac * Math.PI
    const x1 = cx + outerR * Math.cos(sA), y1 = cy + outerR * Math.sin(sA)
    const x2 = cx + outerR * Math.cos(eA), y2 = cy + outerR * Math.sin(eA)
    const x3 = cx + innerR * Math.cos(eA), y3 = cy + innerR * Math.sin(eA)
    const x4 = cx + innerR * Math.cos(sA), y4 = cy + innerR * Math.sin(sA)
    const large = endFrac - startFrac > 0.5 ? 1 : 0
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`
  }

  // Needle
  const needleAngle = Math.PI + (animatedAngle / 180) * Math.PI
  const needleLen = 75
  const nx = cx + needleLen * Math.cos(needleAngle)
  const ny = cy + needleLen * Math.sin(needleAngle)

  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-text-muted mb-2">Índice de Estrés Hídrico</h3>
      <svg viewBox="0 0 240 140" className="w-full max-w-[240px]">
        {/* Arc sections */}
        {SECTIONS.map((sec, i) => {
          const prev = i === 0 ? 0 : SECTIONS[i - 1].max / maxValue
          const curr = sec.max / maxValue
          return (
            <path key={sec.label} d={arcPath(prev, Math.min(curr, 1))} fill={sec.color} opacity={0.6} />
          )
        })}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#F8FAFC" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill="#F8FAFC" />
      </svg>
      <div className="text-3xl font-bold mt-1" style={{ color: level.color }}>{value.toFixed(2)}</div>
      <div className="text-sm font-semibold" style={{ color: level.color }}>{level.label}</div>
    </div>
  )
}
