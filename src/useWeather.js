import { useState, useEffect, useCallback } from 'react'

const api = () => window.__PLUGIN_API__
const CACHE_KEY = 'weather'
const CACHE_TTL = 300
// ponytail: host 保留缓存 1 天让旧数据能立即渲染；新鲜度由 _ts 对比 CACHE_TTL 判定
const CACHE_KEEP = 86400

export function useWeather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async (city, force = false) => {
    const p = api()
    const cached = await p.call('getCache', CACHE_KEY)
    const showed = cached && !city
    if (showed) {
      setData(cached)
      setLoading(false)
      if (Date.now() - (cached._ts || 0) < CACHE_TTL * 1000 && !force) return
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
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
      d._ts = Date.now()
      p.call('setCache', CACHE_KEY, d, CACHE_KEEP).catch(() => {})
      p.call('setSettings', 'city', city || s.city || '').catch(() => {})
      setData(d)
    } catch (e) {
      if (!showed) setError(e.message || String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchWeather() }, [fetchWeather])

  return { data, loading, refreshing, error, refetch: fetchWeather }
}
