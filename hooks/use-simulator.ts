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

// Realistic-ish ECG: flat near 0 with a QRS+T complex every ~8 values.
// `noisy` is disabled for the initial (SSR) render to avoid hydration mismatch.
function generateEcg(noisy = true): number[] {
  const data: number[] = []
  for (let i = 0; i < 40; i++) {
    const phase = i % 8
    let value = 0
    switch (phase) {
      case 0:
        value = -0.3 // Q wave dip
        break
      case 1:
        value = 1.0 // R peak
        break
      case 2:
        value = -0.2 // S dip
        break
      case 4:
        value = 0.3 // T wave
        break
      default:
        value = 0 // baseline
    }
    // tiny noise so it feels alive (skipped on the deterministic initial render)
    if (noisy) value += (Math.random() - 0.5) * 0.05
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
    ecgData: generateEcg(false),
  }))
}

export function useSimulator(): [Athlete[], () => void] {
  const [athletes, setAthletes] = useState<Athlete[]>(createInitialAthletes)
  const nextIdRef = useRef(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setAthletes((prev) =>
        prev.map((a) => ({
          ...a,
          connected: generateConnected(),
          bpm: generateBpm(),
          temp: generateTemp(),
          posture: generatePosture(),
          ecgData: generateEcg(),
        })),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const addAthlete = useCallback(() => {
    setAthletes((prev) => {
      if (prev.length >= 8) return prev
      const id = nextIdRef.current
      nextIdRef.current += 1
      const newAthlete: Athlete = {
        id,
        name: `Atleta ${prev.length + 1}`,
        number: `#${id}`,
        connected: true,
        bpm: generateBpm(),
        temp: generateTemp(),
        posture: "standing",
        ecgData: generateEcg(),
      }
      return [...prev, newAthlete]
    })
  }, [])

  return [athletes, addAthlete]
}
