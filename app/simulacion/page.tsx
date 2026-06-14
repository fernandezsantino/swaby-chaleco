"use client"

import { AthleteCard } from "@/components/athlete-card"
import { Navbar } from "@/components/navbar"
import { useSimulator } from "@/hooks/use-simulator"

export default function SimulacionPage() {
  const [athletes, addAthlete] = useSimulator()

  return (
    <div
      className="min-h-screen bg-gray-950 font-sans text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <Navbar count={athletes.length} onAddAthlete={addAthlete} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
          {athletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>

        <footer className="mt-8 flex justify-center">
          <span className="rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
            Simulador Activo — datos de demostración
          </span>
        </footer>
      </main>
    </div>
  )
}
