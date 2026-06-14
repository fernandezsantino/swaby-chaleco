"use client"

import useSWR from "swr"
import type { Posture } from "@/lib/types"

export interface LiveReading {
  deviceId: string
  bpm: number
  temp: number
  posture: Posture
  ecg: number[]
  connected: boolean
  updatedAt: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Polls the readings API every second and returns a map of deviceId -> reading.
export function useReadings() {
  const { data, error, isLoading } = useSWR<{ readings: LiveReading[]; serverTime: number }>(
    "/api/readings",
    fetcher,
    { refreshInterval: 1000 },
  )

  const byDevice = new Map<string, LiveReading>()
  for (const r of data?.readings ?? []) {
    byDevice.set(r.deviceId, r)
  }

  return { byDevice, error, isLoading }
}
