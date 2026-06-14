"use client"

import Link from "next/link"
import { ArrowLeft, UserPlus, Zap } from "lucide-react"

export function Navbar({
  count,
  onAddAthlete,
}: {
  count: number
  onAddAthlete: () => void
}) {
  const isFull = count >= 8

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Left: logo + title */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="mr-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-gray-500 transition-colors hover:text-white"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={18} />
          </Link>
          <Zap className="text-blue-500" size={22} />
          <span className="text-lg font-semibold text-white">SmartVest Monitor</span>
          <span className="hidden rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400 sm:inline">
            Simulador
          </span>
        </div>

        {/* Center: live status pill */}
        <div className="hidden items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-3 py-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-500" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-400">LIVE</span>
          <span className="text-xs text-gray-400">Sistema Activo</span>
        </div>

        {/* Right: add athlete button */}
        <button
          type="button"
          onClick={onAddAthlete}
          disabled={isFull}
          title={isFull ? "Máximo de atletas alcanzado" : "Añadir atleta"}
          className={`flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 ${
            isFull ? "cursor-not-allowed opacity-50 hover:bg-blue-500" : ""
          }`}
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Añadir Atleta</span>
          <span className="rounded bg-blue-600/60 px-1.5 py-0.5 text-xs font-bold">{count}/8</span>
        </button>
      </div>
    </header>
  )
}
