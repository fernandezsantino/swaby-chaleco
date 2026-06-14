export type Posture = "standing" | "sitting" | "lying" | "fall"

export interface Athlete {
  id: number
  name: string
  number: string // jersey number e.g. "#7"
  age?: number // years
  weight?: number // kg
  height?: number // cm
  connected: boolean // Bluetooth connection status
  bpm: number // heart rate
  temp: number // body temperature in °C (e.g. 36.8)
  posture: Posture
  ecgData: number[] // array of 40 values between -1 and 1 for ECG wave
}
