import { NextResponse } from "next/server"
import type { Posture } from "@/lib/types"

export interface DeviceReading {
  deviceId: string
  bpm: number
  temp: number
  posture: Posture
  ecg: number[]
  updatedAt: number
}

// In-memory store of the latest reading per device. The ESP32 POSTs here and
// the monitoring page polls via GET. (Resets on cold start — swap for a DB
// like Neon/Upstash for durable history.)
const store = new Map<string, DeviceReading>()

// Readings older than this are considered disconnected.
const STALE_MS = 10_000

export async function GET() {
  const now = Date.now()
  const readings = Array.from(store.values()).map((r) => ({
    ...r,
    connected: now - r.updatedAt < STALE_MS,
  }))
  return NextResponse.json({ readings, serverTime: now })
}

export async function POST(request: Request) {
  let body: Partial<DeviceReading>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { deviceId, bpm, temp, posture, ecg } = body
  if (!deviceId || typeof deviceId !== "string") {
    return NextResponse.json({ error: "deviceId is required" }, { status: 400 })
  }

  const reading: DeviceReading = {
    deviceId,
    bpm: typeof bpm === "number" ? bpm : 0,
    temp: typeof temp === "number" ? temp : 0,
    posture: (posture as Posture) ?? "standing",
    ecg: Array.isArray(ecg) ? ecg.slice(0, 120) : [],
    updatedAt: Date.now(),
  }
  store.set(deviceId, reading)

  return NextResponse.json({ ok: true })
}
