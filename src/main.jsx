import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useWeather } from './useWeather'
import { getWeatherIcon, dataIcons } from './iconMap'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { Button, Input } from '@qomicex/plugin-ui'
import './index.css'

function Page() {
  const { data, loading, error, refetch } = useWeather()
  const [cityInput, setCityInput] = useState('')

  useEffect(() => {
    document.body.style.cssText = 'margin:0;overflow:hidden;background:transparent;font-family:system-ui,sans-serif;color:hsl(var(--foreground));height:100%'
    document.getElementById('root').style.cssText = 'height:100%'
    window.__PLUGIN_API__?.call('getSettings').then(s => {
      if (s?.city) setCityInput(s.city)
    }).catch(() => {})
  }, [])

  const handleSearch = () => refetch(cityInput.trim())

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="max-w-[720px] mx-auto p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            {data ? (() => { const I = getWeatherIcon(data.weather_icon); return <I size={24} /> })() : <RefreshCw size={24} />}
          </div>
          <div>
            <p className="text-xl font-bold m-0">天气</p>
            <p className="text-xs text-muted-foreground mt-0.5">数据来源 uapis.cn · 免费接口</p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-4 items-center">
          <Input
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder="城市（留空自动定位）"
            className="flex-1 max-w-[220px]"
          />
          <Button variant="primary" size="sm" onClick={handleSearch}>查询</Button>
          <Button variant="ghost" size="sm" onClick={() => refetch(cityInput.trim())}>
            <RefreshCw size={14} /> 刷新
          </Button>
        </div>

        {/* Content */}
        {loading && <div className="p-loader m-5 mx-auto" />}
        {error && <div className="text-destructive text-sm p-3">天气获取失败：{error}</div>}
        {data && !loading && <WeatherContent data={data} />}
      </div>
    </div>
  )
}

function WeatherContent({ data }) {
  const city = [data.province, data.city, data.district].filter(Boolean).join(' ')
  const MainIcon = getWeatherIcon(data.weather_icon)

  const realtimeItems = [
    ['体感温度', data.feels_like != null ? `${Math.round(data.feels_like)}°` : '—', 'feels_like'],
    ['相对湿度', data.humidity != null ? `${data.humidity}%` : '—', 'humidity'],
    ['风向', data.wind_direction || '—', 'wind_direction'],
    ['风力', data.wind_power || '—', 'wind_power'],
    ['能见度', data.visibility != null ? `${data.visibility}km` : '—', 'visibility'],
    ['气压', data.pressure != null ? `${data.pressure}hPa` : '—', 'pressure'],
    ['紫外线', data.uv != null ? data.uv : '—', 'uv'],
    ['降水量', data.precipitation != null ? `${data.precipitation}mm` : '—', 'precipitation'],
  ]

  const aqiItems = []
  if (data.aqi != null) {
    aqiItems.push(['空气质量', `${data.aqi} (${data.aqi_category || ''})`, null])
    if (data.air_pollutants) {
      const ap = data.air_pollutants
      if (ap.pm25 != null) aqiItems.push(['PM2.5', `${ap.pm25} μg/m³`, null])
      if (ap.pm10 != null) aqiItems.push(['PM10', `${ap.pm10} μg/m³`, null])
      if (ap.o3 != null) aqiItems.push(['臭氧', `${ap.o3} μg/m³`, null])
    }
  }

  return (
    <>
      {/* Current weather */}
      <div className="flex items-center gap-[18px] bg-card/80 border border-border/30 rounded-xl p-[20px_22px] mb-4 backdrop-blur-md">
        <MainIcon size={52} strokeWidth={1.5} />
        <span className="text-[46px] font-bold tracking-wide">{Math.round(data.temperature)}°</span>
        <div className="text-sm text-muted-foreground leading-[1.7]">
          {data.weather || ''}
          {data.temp_min != null && data.temp_max != null && <><br />{Math.round(data.temp_min)}° ~ {Math.round(data.temp_max)}°</>}
          <br />{city} · {data.report_time || ''}
        </div>
      </div>

      {/* Realtime data */}
      <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/80 my-5 mb-2.5">实时数据</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
        {realtimeItems.map(([label, value, key], i) => {
          const DIcon = dataIcons[key]
          return (
            <div key={i} className="bg-card/80 border border-border/30 rounded-xl p-[10px_14px]">
              <div className="text-[10px] font-medium tracking-[.06em] text-muted-foreground/80 mb-0.5 flex items-center gap-1">
                {DIcon && <DIcon size={12} />} {label}
              </div>
              <div className="text-[15px] font-semibold text-foreground">{value}</div>
            </div>
          )
        })}
      </div>

      {/* AQI */}
      {aqiItems.length > 0 && (
        <>
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/80 my-5 mb-2.5">空气质量</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
            {aqiItems.map(([label, value], i) => (
              <div key={i} className="bg-card/80 border border-border/30 rounded-xl p-[10px_14px]">
                <div className="text-[10px] font-medium tracking-[.06em] text-muted-foreground/80 mb-0.5 flex items-center gap-1">{label}</div>
                <div className="text-[15px] font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: value }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Forecast */}
      {data.forecast && data.forecast.length > 0 && (
        <>
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/80 my-5 mb-2.5">未来 {data.forecast.length} 天</div>
          <div className="flex gap-2 overflow-x-auto pb-1.5">
            {data.forecast.map((f, i) => {
              const FIcon = getWeatherIcon(f.weather_day)
              return (
                <div key={i} className="flex-none w-20 bg-card/80 border border-border/30 rounded-xl py-2.5 px-1.5 text-center transition-colors hover:bg-card/90">
                  <div className="text-[11px] font-semibold">{f.week || f.date}</div>
                  <div className="my-1.5"><FIcon size={22} /></div>
                  <div className="text-[11px] text-muted-foreground">{Math.round(f.temp_min)}° / {Math.round(f.temp_max)}°</div>
                  <div className="text-[11px] text-muted-foreground">{f.weather_day || ''}</div>
                  {f.sunrise && <div className="text-[10px] text-muted-foreground">🌅{f.sunrise} 🌇{f.sunset || ''}</div>}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="mt-3">
          {data.alerts.map((a, i) => (
            <div key={i} className="rounded-[10px] p-[10px_12px] mt-2 first:mt-0 border border-hsl(45,80%,50%,0.3) bg-hsl(45,80%,50%,0.08) text-xs leading-relaxed flex gap-2 items-start">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-hsl(45,80%,50%)" />
              <div>
                <div className="font-semibold">{a.title || ''}</div>
                <div className="mt-0.5">{a.text || ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById('root')).render(<Page />)
