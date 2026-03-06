
import { useCallback, useEffect, useState } from "react"
import { fetchStats, Stats } from "../api/statsApi"

type UseStatsResult = {
  data: Stats | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

export function useStats(): UseStatsResult {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    const MIN_LOADING_MS = 500
    const startedAt = Date.now()

    setLoading(true)
    setError(null)
    try {
      const result = await fetchStats(signal)
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setError("Failed to load stats")
    } finally {
      const elapsed = Date.now() - startedAt
      const remaining = MIN_LOADING_MS - elapsed
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)

    return () => controller.abort()
  }, [load])

  return { data, loading, error, lastUpdated, refresh: () => load() }
}
