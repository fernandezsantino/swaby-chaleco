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

// ECG built from sharp QRS spikes whose RATE and HEIGHT track the BPM:
//  - higher BPM  -> spikes packed closer together (more beats) and taller
//  - lower BPM   -> spikes spread out and flatter
// This makes effort visible: a working athlete shows a faster, bigger wave.
// `noisy` is disabled for the initial (SSR) render to avoid hydration mismatch.
function generateEcg(bpm: number, noisy = true): number[] {
  const total = 60
  // samples per heartbeat: fewer samples => spikes closer together (faster HR)
  const samplesPerBeat = Math.max(6, Math.round(1400 / bpm))
  // amplitude scales 0.6 (resting ~55 bpm) up to ~1.4 (max ~175 bpm)
  const ampScale = 0.6 + Math.min(1, Math.max(0, (bpm - 55) / 120)) * 0.8
  // T-wave bump roughly mid-beat, kept clear of the QRS spikes
  let tPhase = Math.round(samplesPerBeat * 0.5)
  if (tPhase <= 3) tPhase = 4

  const data: number[] = []
  for (let i = 0; i < total; i++) {
    const phase = i % samplesPerBeat
    let value = 0
    if (phase === 1) value = -0.15 // Q dip
    else if (phase === 2) value = 1.0 // R peak (sharp spike)
    else if (phase === 3) value = -0.25 // S dip
    else if (phase === tPhase) value = 0.3 // T wave
    value *= ampScale
    // tiny noise so it feels alive (skipped on the deterministic initial render)
    if (noisy) value += (Math.random() - 0.5) * 0.04
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
