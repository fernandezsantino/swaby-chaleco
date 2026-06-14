import Image from "next/image"
import Link from "next/link"
import { Activity, ArrowRight, HeartPulse, Radio, ShieldAlert, Thermometer, Zap } from "lucide-react"

const features = [
  {
    Icon: HeartPulse,
    title: "Frecuencia cardíaca",
    desc: "Pulso en tiempo real con zonas de esfuerzo y alertas automáticas.",
  },
  {
    Icon: Activity,
    title: "Electrocardiograma",
    desc: "Señal ECG continua para visualizar el ritmo cardíaco al instante.",
  },
  {
    Icon: Thermometer,
    title: "Temperatura corporal",
    desc: "Detección temprana de fiebre o golpe de calor durante el esfuerzo.",
  },
  {
    Icon: ShieldAlert,
    title: "Detección de caídas",
    desc: "Alerta silenciosa ante posibles desmayos o pérdidas de postura.",
  },
]

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-gray-950 font-sans text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    >
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-500" size={22} />
            <span className="text-lg font-semibold">SmartVest Monitor</span>
          </div>
          <span className="text-sm text-gray-500">por Swaby</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-2 md:py-20">
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Wearable biométrico para deportistas
            </span>
            <h1 className="text-pretty text-4xl font-bold leading-tight md:text-5xl">
              Monitorea la salud de tus atletas en tiempo real
            </h1>
            <p className="text-pretty leading-relaxed text-gray-400">
              SmartVest es un chaleco inteligente con sensores que miden frecuencia cardíaca, ECG, temperatura y
              postura. Los datos se transmiten desde un ESP32 al panel del entrenador para cuidar a cada deportista
              durante el entrenamiento y la competición.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/simulacion"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Probar la simulación
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/monitoreo"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-green-500/50 hover:bg-gray-800"
              >
                Monitoreo real
                <Radio size={16} />
              </Link>
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-800">
            <Image
              src="/smartvest-hero.png"
              alt="Chaleco inteligente SmartVest con sensores biométricos integrados"
              fill
              priority
              className="object-cover"
            />
          </div>
        </section>

        {/* Features */}
        <section className="py-8">
          <h2 className="mb-6 text-center text-2xl font-bold">¿Qué mide el chaleco?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <Icon className="text-blue-400" size={24} />
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Two options */}
        <section className="py-12">
          <h2 className="mb-2 text-center text-2xl font-bold">Elige cómo empezar</h2>
          <p className="mb-8 text-center text-sm text-gray-500">
            Explora el sistema con datos de demostración o conéctate a un chaleco real.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Simulation option */}
            <Link
              href="/simulacion"
              className="group flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-blue-500/50"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
                  <Activity size={22} />
                </span>
                <h3 className="text-lg font-semibold">Simulación</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                Visualiza el panel del entrenador con atletas de demostración. Los datos vitales, el ECG y las alertas
                se generan automáticamente para que veas cómo funciona el sistema, sin necesidad de hardware.
              </p>
              <span className="mt-1 flex items-center gap-1 text-sm font-medium text-blue-400">
                Abrir simulación
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            {/* Real monitoring option */}
            <Link
              href="/monitoreo"
              className="group flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-green-500/50"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-green-500/20 p-2 text-green-400">
                  <Radio size={22} />
                </span>
                <h3 className="text-lg font-semibold">Monitoreo real</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                Registra a las personas con el nombre y el ID de su chaleco, y observa los datos reales que envía cada
                ESP32 en vivo: frecuencia cardíaca, ECG, temperatura y postura.
              </p>
              <span className="mt-1 flex items-center gap-1 text-sm font-medium text-green-400">
                Abrir monitoreo real
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-6">
        <p className="text-center text-xs text-gray-600">SmartVest Monitor — Swaby</p>
      </footer>
    </div>
  )
}
