
export type Stats = {
  users: number
  active_today: number
  conversion_rate: number
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000"

export async function fetchStats(signal?: AbortSignal): Promise<Stats> {
  const res = await fetch(`${API_BASE_URL}/stats`, { signal })

  if (!res.ok) {
    throw new Error(`Failed to fetch stats (status ${res.status})`)
  }

  const data: unknown = await res.json()

  if (
    !data ||
    typeof (data as any).users !== "number" ||
    typeof (data as any).active_today !== "number" ||
    typeof (data as any).conversion_rate !== "number"
  ) {
    throw new Error("Invalid API response shape")
  }

  return data as Stats
}
