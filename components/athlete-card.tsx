"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  Armchair,
  Bluetooth,
  BluetoothOff,
  Heart,
  Minus,
  PersonStanding,
  Thermometer,
  TriangleAlert,
} from "lucide-react"
import type { Athlete } from "@/lib/types"

function EcgStrip({ data, connected }: { data: number[]; connected: boolean }) {
  if (!connected) {
    return (
      <div className="relative rounded-lg bg-gray-800 px-2 py-1">
        <span className="absolute left-2 top-1 text-xs text-gray-500">ECG</span>
        <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="200" y2="30" stroke="#374151" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-mono text-gray-600">
          -- --
        </span>
      </div>
    )
  }

  const n = data.length
  const width = 200
  // map each value to coordinates; baseline at y=30, amplitude scaled by 24
  const toPoints = (offsetX: number) =>
    data
      .map((v, i) => {
        const x = (i / (n - 1)) * width + offsetX
        const y = 30 - v * 24
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

  // tile twice so the scroll animation loops seamlessly
  const points = `${toPoints(0)} ${toPoints(width)}`

  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-800 px-2 py-1">
      <span className="absolute left-2 top-1 z-10 text-xs text-gray-500">ECG</span>
      <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">
        <line x1="0" y1="30" x2="200" y2="30" stroke="#374151" strokeWidth="1" />
        <g className="animate-ecg-scroll">
          <polyline points={points} stroke="#22C55E" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </div>
  )
}

function HeartRate({ bpm }: { bpm: number }) {
  const isAlert = bpm < 50 || bpm > 160

  let zoneColor = "bg-green-500"
  let zoneLabel = "Normal"
  if (bpm < 60) {
    zoneColor = "bg-blue-500"
    zoneLabel = "Reposo"
  } else if (bpm <= 100) {
    zoneColor = "bg-green-500"
    zoneLabel = "Normal"
  } else if (bpm <= 140) {
    zoneColor = "bg-amber-500"
    zoneLabel = "Esfuerzo"
  } else {
    zoneColor = "bg-red-500"
    zoneLabel = "Máximo"
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Heart className="text-red-400" size={16} />
        <span className="text-xs text-gray-500">Frecuencia</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-2xl font-bold ${isAlert ? "text-red-500" : "text-white"}`}>{bpm}</span>
        <span className="text-xs text-gray-500">BPM</span>
        {isAlert && <TriangleAlert className="text-red-500" size={16} />}
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${zoneColor}`} aria-hidden="true" />
        <span className="text-xs text-gray-400">{zoneLabel}</span>
      </div>
    </div>
  )
}

function Temperature({ temp }: { temp: number }) {
  const isAlert = temp > 38.0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Thermometer className="text-orange-400" size={16} />
        <span className="text-xs text-gray-500">Temperatura</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-2xl font-bold ${isAlert ? "text-red-500" : "text-white"}`}>{temp.toFixed(1)}</span>
        <span className="text-xs text-gray-500">°C</span>
      </div>
      <span className="text-xs text-gray-600">Temp. Corporal</span>
    </div>
  )
}

function PostureIndicator({ posture }: { posture: Athlete["posture"] }) {
  if (posture === "fall") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-500 bg-red-500/20 px-3 py-2">
        <AlertTriangle className="shrink-0 text-red-500" size={20} />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide text-red-400">ALERTA: CAÍDA</span>
          <span className="text-xs text-red-400/70">Posible desmayo detectado</span>
        </div>
      </div>
    )
  }

  const map = {
    standing: { Icon: PersonStanding, label: "Parado", color: "text-green-400" },
    sitting: { Icon: Armchair, label: "Sentado", color: "text-blue-400" },
    lying: { Icon: Minus, label: "Acostado", color: "text-amber-400" },
  } as const

  const { Icon, label, color } = map[posture]

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-2">
      <Icon className={color} size={18} />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  )
}

export function AthleteCard({ athlete }: { athlete: Athlete }) {
  const [secondsAgo, setSecondsAgo] = useState(0)

  // reset the "last update" counter whenever fresh data arrives
  useEffect(() => {
    setSecondsAgo(0)
    const interval = setInterval(() => setSecondsAgo((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [athlete.bpm, athlete.temp, athlete.posture, athlete.connected])

  const isFall = athlete.posture === "fall"

  return (
    <div
      className={`animate-card-fade-in flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-blue-500/40 ${
        isFall ? "ring-1 ring-red-500/50" : ""
      }`}
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-sm font-bold text-blue-400">{athlete.number}</span>
          <span className="text-base font-semibold text-white">{athlete.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {athlete.connected ? (
            <>
              <Bluetooth className="text-blue-400" size={16} />
              <span className="text-xs text-green-400">Conectado</span>
            </>
          ) : (
            <>
              <BluetoothOff className="text-gray-600" size={16} />
              <span className="text-xs text-gray-500">Sin señal</span>
            </>
          )}
        </div>
      </div>

      {/* 2. ECG */}
      <EcgStrip data={athlete.ecgData} connected={athlete.connected} />

      {/* 3. Vitals */}
      <div className="grid grid-cols-2 gap-3">
        {athlete.connected ? (
          <>
            <HeartRate bpm={athlete.bpm} />
            <Temperature temp={athlete.temp} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Heart className="text-red-400" size={16} />
                <span className="text-xs text-gray-500">Frecuencia</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">--</span>
              <span className="text-xs text-gray-600">BPM</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Thermometer className="text-orange-400" size={16} />
                <span className="text-xs text-gray-500">Temperatura</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">--</span>
              <span className="text-xs text-gray-600">°C</span>
            </div>
          </>
        )}
      </div>

      {/* 4. Posture */}
      <PostureIndicator posture={athlete.posture} />

      {/* 5. Footer */}
      <div className="border-t border-gray-800 pt-2">
        <span className="text-xs text-gray-600">
          Última actualización: hace {secondsAgo}s
        </span>
      </div>
    </div>
  )
}
