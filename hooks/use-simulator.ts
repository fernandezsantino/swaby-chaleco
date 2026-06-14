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

// One smooth PQRST heartbeat modeled as a sum of Gaussian bumps.
// t runs [0,1) within a single beat -> produces rounded, sinusoidal curves
// instead of sharp triangular spikes.
function ecgBeat(t: number): number {
  const g = (center: number, width: number, amp: number) =>
    amp * Math.exp(-((t - center) ** 2) / (2 * width * width))
  return (
    g(0.18, 0.028, 0.14) + // P wave
    g(0.38, 0.013, -0.12) + // Q dip
    g(0.42, 0.011, 1.0) + // R peak
    g(0.46, 0.014, -0.3) + // S dip
    g(0.68, 0.05, 0.34) // T wave
  )
}

// Smooth ECG: dense sampling of the PQRST beat morphology so the rendered
// curve looks sinusoidal. `noisy` is disabled for the initial (SSR) render
// to avoid hydration mismatch.
function generateEcg(noisy = true): number[] {
  const total = 90
  const beats = 3
  const data: number[] = []
  for (let i = 0; i < total; i++) {
    const t = ((i / total) * beats) % 1
    let value = ecgBeat(t)
    if (noisy) value += (Math.random() - 0.5) * 0.025
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
