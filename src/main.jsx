import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useWeather } from './useWeather.js'
import { getWeatherIcon, dataIcons } from './iconMap.js'
import { RefreshCw, Settings } from 'lucide-react'
import { Button, Input } from '@qomicex/plugin-ui'
import './index.css'

const api = () => window.__PLUGIN_API__

function DetailPage() {
  const { data, loading, refreshing, error, refetch } = useWeather()
  const [cityInput, setCityInput] = useState('')

  useEffect(() => {
    document.body.style.cssText = 'margin:0;background:transparent;font-family:system-ui,sans-serif;color:hsl(var(--foreground))'
  }, [])

  useEffect(() => {
    if (data?.city) setCityInput(c => c || data.city)
  }, [data])

  const openSettings = () => api().call('openPluginSettings').catch(() => {})

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {loading ? '加载天气…' : `天气获取失败${error ? `：${error}` : ''}`}
      </div>
    )
  }

  const city = [data.province, data.city, data.district].filter(Boolean).join(' ')
  const Icon = getWeatherIcon(data.weather_icon)

  const gridItems = [
    ['体感温度', data.feels_like != null ? `${Math.round(data.feels_like)}°` : '—', 'feels_like'],
    ['相对湿度', data.humidity != null ? `${data.humidity}%` : '—', 'humidity'],
    ['风向', data.wind_direction || '—', 'wind_direction'],
    ['风力', data.wind_power || '—', 'wind_power'],
    ['能见度', data.visibility != null ? `${data.visibility}km` : '—', 'visibility'],
    ['气压', data.pressure != null ? `${data.pressure}hPa` : '—', 'pressure'],
    ['紫外线', data.uv != null ? data.uv : '—', 'uv'],
    ['降水量', data.precipitation != null ? `${data.precipitation}mm` : '—', 'precipitation'],
  ]

  if (data.aqi != null) {
    gridItems.push(['AQI', `${data.aqi}（${data.aqi_category || ''}）`, null])
    if (data.air_pollutants) {
      const ap = data.air_pollutants
      const parts = [`PM2.5 ${ap.pm25}`, `PM10 ${ap.pm10}`, `O3 ${ap.o3}`].filter(x => !x.includes('undefined'))
      gridItems.push(['污染物', parts.join(' / '), null])
    }
  }

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold truncate">{city || '天气'}</div>
          <div className="text-xs text-muted-foreground">{data.weather || ''} · 更新于 {data.report_time || ''}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={openSettings}>
          <Settings size={14} /> 设置
        </Button>
      </div>

      <div className="flex gap-2 mb-3.5 items-center">
        <Input
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') refetch(cityInput.trim(), true) }}
          placeholder="城市（留空自动定位）"
          className="flex-1"
        />
        <Button variant="primary" size="sm" disabled={loading || refreshing} onClick={() => refetch(cityInput.trim(), true)}>查询</Button>
        <Button variant="ghost" size="sm" disabled={loading || refreshing} onClick={() => refetch(undefined, true)}>
          <RefreshCw size={14} /> 刷新
        </Button>
      </div>

      <div className="flex items-center gap-3.5 mb-3.5 p-3 rounded-[10px] bg-card/60 border border-border/30">
        <Icon size={44} strokeWidth={1.6} />
        <span className="text-[38px] font-bold">{Math.round(data.temperature)}°</span>
        <div className="text-xs text-muted-foreground">
          {data.weather || ''}
          {data.temp_min != null && data.temp_max != null && <><br />{Math.round(data.temp_min)}° ~ {Math.round(data.temp_max)}°</>}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 mb-3.5">
        {gridItems.map(([label, value, key], i) => {
          const DIcon = key ? dataIcons[key] : null
          return (
            <div key={i} className="bg-card/60 border border-border/30 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                {DIcon && <DIcon size={12} />} {label}
              </div>
              <div className="text-[13px] font-semibold mt-0.5">{value}</div>
            </div>
          )
        })}
      </div>

      {data.forecast && data.forecast.length > 0 && (
        <>
          <div className="text-[11px] font-semibold text-muted-foreground mb-2">未来 {data.forecast.length} 天</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.forecast.map((f, i) => {
              const FIcon = getWeatherIcon(f.weather_day)
              return (
                <div key={i} className="flex-none w-[68px] bg-card/60 border border-border/30 rounded-lg p-2 text-center">
                  <div className="text-[11px] font-semibold">{f.week || f.date}</div>
                  <div className="my-1"><FIcon size={20} /></div>
                  <div className="text-[11px] text-muted-foreground">{Math.round(f.temp_min)}° / {Math.round(f.temp_max)}°</div>
                  <div className="text-[11px] text-muted-foreground">{f.weather_day || ''}</div>
                  {f.sunrise && <div className="text-[10px] text-muted-foreground">🌅{f.sunrise} 🌇{f.sunset || ''}</div>}
                </div>
              )
            })}
          </div>
        </>
      )}

      {data.alerts && data.alerts.length > 0 && (
        <div className="mt-2.5">
          {data.alerts.map((a, i) => (
            <div key={i} className="rounded-lg p-2 mt-1.5 first:mt-0 border border-[hsl(45,80%,50%,0.3)] bg-[hsl(45,80%,50%,0.08)] text-[11px] text-foreground">
              ⚠️ {a.title || ''}<br />{a.text || ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<DetailPage />)
