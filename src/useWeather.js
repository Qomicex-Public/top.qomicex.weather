import { useState, useEffect, useCallback } from 'react'

const api = () => window.__PLUGIN_API__
const CACHE_KEY = 'weather'
const CACHE_TTL = 1800

export function useWeather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async (city) => {
    setLoading(true)
    setError(null)
    try {
      const p = api()
      const cached = await p.call('getCache', CACHE_KEY)
      if (cached && !city) {
        setData(cached)
        setLoading(false)
        return
      }
      const s = await p.call('getSettings') || {}
      const q = city ? `&city=${encodeURIComponent(city)}` : s.city ? `&city=${encodeURIComponent(s.city)}` : ''
      const r = await p.call('proxyFetch', {
        url: `https://uapis.cn/api/v1/misc/weather?extended=true&forecast=true${q}`,
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: 15000,
      })
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`)
      const d = JSON.parse(r.body)
      p.call('setCache', CACHE_KEY, d, CACHE_TTL).catch(() => {})
      p.call('setSettings', 'city', city || s.city || '').catch(() => {})
      setData(d)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWeather() }, [fetchWeather])

  return { data, loading, error, refetch: fetchWeather }
}
