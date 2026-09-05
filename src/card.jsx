import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useWeather } from './useWeather'
import { getWeatherIcon } from './iconMap'
import './index.css'

const PLUGIN_PAGE = '/plugins/p/top.qomicex.weather'

function Card() {
  const { data, loading } = useWeather()

  useEffect(() => {
    document.documentElement.style.height = '100%'
    document.body.style.cssText = 'margin:0;overflow:hidden;height:100%;background:transparent;font-family:system-ui,sans-serif;color:hsl(var(--foreground))'
    const root = document.getElementById('root')
    if (root) root.style.height = '100%'
  }, [])

  const openDetail = () => {
    window.__PLUGIN_API__?.call('navigate', PLUGIN_PAGE).catch(() => {})
  }

  if (!data) {
    return <div className="p-3 text-xs text-muted-foreground">{loading ? '加载天气…' : '天气获取失败'}</div>
  }

  const Icon = getWeatherIcon(data.weather_icon)
  const city = data.city || data.district || ''
  const extras = []
  if (data.temp_min != null && data.temp_max != null) extras.push(`${Math.round(data.temp_min)}°~${Math.round(data.temp_max)}°`)
  if (data.humidity != null) extras.push(`湿度 ${data.humidity}%`)
  if (data.aqi_category) extras.push(`AQI ${data.aqi_category}`)

  return (
    <div
      onClick={openDetail}
      className="h-full p-4 rounded-xl border border-border/30 bg-card/80 backdrop-blur-md cursor-pointer flex flex-col justify-between transition-colors hover:bg-card/90 box-border"
    >
      <div>
        <div className="flex items-center gap-2 mb-1.5 mt-0.5">
          <span className="text-[10px] font-semibold tracking-[.12em] uppercase text-muted-foreground/70">天气</span>
          <span className="text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{city}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Icon size={34} strokeWidth={1.8} />
          <span className="text-[32px] font-bold tracking-wide">{Math.round(data.temperature)}°</span>
          <span className="text-[11px] text-muted-foreground leading-relaxed ml-auto">
            {data.weather || ''}<br />{extras.join(' · ')}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground/60 mt-1">点击查看详情 · 7 天预报</div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<Card />)
