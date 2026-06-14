"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Athlete, Posture } from "@/lib/types"

const POSTURES: Posture[] = ["standing", "sitting", "lying", "fall"]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// BPM weighted toward 70-130 for realism, full range 55-175
function generateBpm(): number {
  if (Math.random() < 0.85) {
    return randomInt(70, 130)
  }
  return randomInt(55, 175)
}

function generateTemp(): number {
  const t = 36.0 + Math.random() * (39.5 - 36.0)
  return Math.round(t * 10) / 10
}

function generatePosture(): Posture {
  // weight 'fall' at only 5% probability
  if (Math.random() < 0.05) return "fall"
  const others: Posture[] = ["standing", "sitting", "lying"]
  return others[randomInt(0, others.length - 1)]
}

function generateConnected(): boolean {
  // 95% chance true each tick
  return Math.random() < 0.95
}

// One smooth heartbeat complex over t in [0,1): a flat baseline interrupted by
// a small P bump, a tall sharp R peak, a deep S undershoot, then a rounded T
// recovery — matching the glowing monitor look. Built from Gaussian bumps so it
// renders as a smooth curve rather than jagged segments.
function ecgBeat(t: number): number {
  const g = (center: number, width: number, amp: number) =>
    amp * Math.exp(-((t - center) ** 2) / (2 * width * width))
  return (
    g(0.16, 0.03, 0.12) + // P wave (small rounded rise)
    g(0.33, 0.014, -0.12) + // Q dip
    g(0.38, 0.012, 1.0) + // R peak (tall, sharp)
    g(0.45, 0.022, -0.5) + // S wave (deep undershoot)
    g(0.62, 0.05, 0.22) // T wave (rounded bump back up)
  )
}

// ECG whose RATE and HEIGHT track the BPM, sampled densely so it draws as a
// smooth glowing trace:
//  - higher BPM -> more beats across the strip (packed closer) and taller
//  - lower BPM  -> fewer, flatter beats with longer flat baseline
// `noisy` is disabled for the initial (SSR) render to avoid hydration mismatch.
function generateEcg(bpm: number, noisy = true): number[] {
  const total = 120
  // number of heartbeats shown across the strip scales with BPM (2 at rest -> ~6 at max)
  const beats = Math.min(6, Math.max(2, Math.round(bpm / 24)))
  // amplitude scales 0.6 (resting ~55 bpm) up to ~1.4 (max ~175 bpm)
  const ampScale = 0.6 + Math.min(1, Math.max(0, (bpm - 55) / 120)) * 0.8

  const data: number[] = []
  for (let i = 0; i < total; i++) {
    const t = ((i / total) * beats) % 1
    let value = ecgBeat(t) * ampScale
    // tiny noise so it feels alive (skipped on the deterministic initial render)
    if (noisy) value += (Math.random() - 0.5) * 0.02
    data.push(Number(value.toFixed(3)))
  }
  return data
}

// Deterministic so server and client render identically before the simulator
// interval kicks in (prevents React hydration mismatches).
function createInitialAthletes(): Athlete[] {
  const seed: Array<{ name: string; number: string; bpm: number; temp: number }> = [
    { name: "Carlos Mendez", number: "#7", bpm: 78, temp: 36.8 },
    { name: "Laura Pérez", number: "#11", bpm: 92, temp: 37.1 },
    { name: "Diego Ruiz", number: "#3", bpm: 85, temp: 36.9 },
    { name: "Ana Torres", number: "#21", bpm: 70, temp: 37.0 },
  ]

  return seed.map((s, i) => ({
    id: i + 1,
    name: s.name,
    number: s.number,
    connected: true,
    bpm: s.bpm,
    temp: s.temp,
    posture: "standing",
    ecgData: generateEcg(s.bpm, false),
  }))
}

export function useSimulator(): [Athlete[], () => void] {
  const [athletes, setAthletes] = useState<Athlete[]>(createInitialAthletes)
  const nextIdRef = useRef(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setAthletes((prev) =>
        prev.map((a) => {
          const bpm = generateBpm()
          return {
            ...a,
            connected: generateConnected(),
            bpm,
            temp: generateTemp(),
            posture: generatePosture(),
            ecgData: generateEcg(bpm),
          }
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const addAthlete = useCallback(() => {
    setAthletes((prev) => {
      if (prev.length >= 8) return prev
      const id = nextIdRef.current
      nextIdRef.current += 1
      const bpm = generateBpm()
      const newAthlete: Athlete = {
        id,
        name: `Atleta ${prev.length + 1}`,
        number: `#${id}`,
        connected: true,
        bpm,
        temp: generateTemp(),
        posture: "standing",
        ecgData: generateEcg(bpm),
      }
      return [...prev, newAthlete]
    })
  }, [])

  return [athletes, addAthlete]
}
