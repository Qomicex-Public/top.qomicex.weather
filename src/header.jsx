import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useWeather } from './useWeather'
import { getWeatherIcon } from './iconMap'
import './index.css'

function Header() {
  const { data, loading } = useWeather()
  const Icon = data ? getWeatherIcon(data.weather_icon) : null

  useEffect(() => {
    const h = document.getElementById('root')
    if (h) h.style.cssText = 'height:100%'
    document.body.style.cssText = 'margin:0;height:100%;overflow:hidden;background:transparent'
  }, [])

  if (loading) {
    return (
      <div className="flex items-center h-full px-2.5 text-xs text-muted-foreground">
        天气…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center h-full px-2.5 text-xs text-muted-foreground">
        --°
      </div>
    )
  }

  const city = data.city || ''

  const navigate = () => {
    window.__PLUGIN_API__?.call('navigate', '/plugins/p/top.qomicex.weather').catch(() => {})
  }

  return (
    <div
      onClick={navigate}
      title="查看天气详情"
      className="flex items-center gap-1.5 h-full px-2.5 text-xs cursor-pointer whitespace-nowrap select-none rounded-md transition-colors hover:bg-muted/40"
    >
      {Icon && <Icon size={14} strokeWidth={2} className="shrink-0" />}
      <span className="font-semibold text-[13px] tracking-wide">{Math.round(data.temperature)}°</span>
      {city && <span className="text-muted-foreground max-w-20 overflow-hidden text-ellipsis text-[11px]">{city}</span>}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<Header />)
