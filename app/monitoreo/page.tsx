"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Radio, Trash2, UserPlus, Wifi } from "lucide-react"
import { AthleteCard } from "@/components/athlete-card"
import { useReadings } from "@/hooks/use-readings"
import type { Athlete } from "@/lib/types"

interface Person {
  id: number
  name: string
  deviceId: string
}

export default function MonitoreoPage() {
  const { byDevice, isLoading } = useReadings()
  const [people, setPeople] = useState<Person[]>([])
  const [name, setName] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const nextId = useState(() => ({ current: 1 }))[0]

  const activeDevices = byDevice.size

  function addPerson(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedDevice = deviceId.trim()
    if (!trimmedName || !trimmedDevice) return
    setPeople((prev) => [...prev, { id: nextId.current++, name: trimmedName, deviceId: trimmedDevice }])
    setName("")
    setDeviceId("")
  }

  function removePerson(id: number) {
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div
      className="min-h-screen bg-gray-950 font-sans text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="mr-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-gray-500 transition-colors hover:text-white"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={18} />
            </Link>
            <Radio className="text-green-500" size={22} />
            <span className="text-lg font-semibold text-white">SmartVest Monitor</span>
            <span className="hidden rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400 sm:inline">
              Monitoreo Real
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-3 py-1.5">
            <Wifi className={activeDevices > 0 ? "text-green-400" : "text-gray-600"} size={16} />
            <span className="text-xs text-gray-400">
              {activeDevices} {activeDevices === 1 ? "dispositivo" : "dispositivos"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Registration + connection info */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Register form */}
          <form
            onSubmit={addPerson}
            className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4"
          >
            <h2 className="text-sm font-semibold text-white">Registrar persona</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la persona"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
              />
              <input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="ID del chaleco (ej. vest-01)"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-gray-950 transition-colors hover:bg-green-600"
            >
              <UserPlus size={16} />
              Añadir persona
            </button>
          </form>

          {/* ESP32 connection helper */}
          <div className="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="text-sm font-semibold text-white">Conectar el ESP32</h2>
            <p className="text-xs leading-relaxed text-gray-400">
              Configura cada chaleco para enviar lecturas por HTTP POST a este endpoint con el mismo{" "}
              <code className="rounded bg-gray-800 px-1 text-green-400">deviceId</code> que registraste:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
              <code>{`POST /api/readings
{
  "deviceId": "vest-01",
  "bpm": 82,
  "temp": 36.8,
  "posture": "standing",
  "ecg": [0.1, 0.9, -0.2, ...]
}`}</code>
            </pre>
          </div>
        </div>

        {/* Live cards */}
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-800 bg-gray-900/50 py-16 text-center">
            <Radio className="text-gray-600" size={32} />
            <p className="text-sm font-medium text-gray-400">Aún no hay personas registradas</p>
            <p className="text-xs text-gray-600">
              Registra a una persona con el ID de su chaleco para ver sus datos en tiempo real.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {people.map((person) => {
              const reading = byDevice.get(person.deviceId)
              const athlete: Athlete = {
                id: person.id,
                name: person.name,
                number: person.deviceId,
                connected: reading?.connected ?? false,
                bpm: reading?.bpm ?? 0,
                temp: reading?.temp ?? 0,
                posture: reading?.posture ?? "standing",
                ecgData: reading?.ecg ?? [],
              }
              return (
                <div key={person.id} className="relative">
                  <button
                    type="button"
                    onClick={() => removePerson(person.id)}
                    aria-label={`Quitar a ${person.name}`}
                    className="absolute right-3 top-3 z-10 rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-800 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                  <AthleteCard athlete={athlete} />
                </div>
              )
            })}
          </div>
        )}

        <footer className="mt-8 flex justify-center">
          <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
            {isLoading ? "Conectando…" : "Escuchando datos en vivo del ESP32"}
          </span>
        </footer>
      </main>
    </div>
  )
}
