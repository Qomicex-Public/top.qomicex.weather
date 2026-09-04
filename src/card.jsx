import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useWeather } from './useWeather'
import { getWeatherIcon, dataIcons } from './iconMap'
import { RefreshCw } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, Button, Input } from '@qomicex/plugin-ui'
import './index.css'

function Card() {
  const { data, loading, refreshing, refetch } = useWeather()
  const [dlgOpen, setDlgOpen] = useState(false)
  const [cityInput, setCityInput] = useState('')

  useEffect(() => {
    document.body.style.cssText = 'margin:0;overflow:hidden;background:transparent;font-family:system-ui,sans-serif;color:hsl(var(--foreground))'
  }, [])

  const openDialog = () => {
    if (loading || !data) return
    setCityInput(data.city || '')
    setDlgOpen(true)
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
    <>
      <div
        onClick={openDialog}
        className="min-h-full p-4 rounded-xl border border-border/30 bg-card/80 backdrop-blur-md cursor-pointer flex flex-col justify-between transition-colors hover:bg-card/90 box-border"
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

      {dlgOpen && (
        <Dialog open onClose={() => setDlgOpen(false)}>
          <DialogContent
            data={data}
            loading={loading || refreshing}
            cityInput={cityInput}
            onCityInput={setCityInput}
            onSearch={() => refetch(cityInput.trim(), true)}
            onRefresh={() => refetch(undefined, true)}
            onClose={() => setDlgOpen(false)}
          />
        </Dialog>
      )}
    </>
  )
}

function DialogContent({ data, loading, cityInput, onCityInput, onSearch, onRefresh, onClose }) {
  if (!data) return null

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
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{city || '天气'}</DialogTitle>
        <DialogDescription>{data.weather || ''} · 更新于 {data.report_time || ''}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        {/* City search */}
        <div className="flex gap-2 mb-3.5 items-center">
          <Input
            value={cityInput}
            onChange={e => onCityInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSearch() }}
            placeholder="城市（留空自动定位）"
            className="flex-1"
          />
          <Button variant="primary" size="sm" disabled={loading} onClick={onSearch}>查询</Button>
          <Button variant="ghost" size="sm" disabled={loading} onClick={onRefresh}>
            <RefreshCw size={14} /> 刷新
          </Button>
        </div>

        {/* Current */}
        <div className="flex items-center gap-3.5 mb-3.5 p-3 rounded-[10px] bg-background">
          <Icon size={44} strokeWidth={1.6} />
          <span className="text-[38px] font-bold">{Math.round(data.temperature)}°</span>
          <div className="text-xs text-muted-foreground">
            {data.weather || ''}
            {data.temp_min != null && data.temp_max != null && <><br />{Math.round(data.temp_min)}° ~ {Math.round(data.temp_max)}°</>}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 mb-3.5">
          {gridItems.map(([label, value, key], i) => {
            const DIcon = key ? dataIcons[key] : null
            return (
              <div key={i} className="bg-background rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {DIcon && <DIcon size={12} />} {label}
                </div>
                <div className="text-[13px] font-semibold mt-0.5" dangerouslySetInnerHTML={{ __html: value }} />
              </div>
            )
          })}
        </div>

        {/* Forecast */}
        {data.forecast && data.forecast.length > 0 && (
          <>
            <div className="text-[11px] font-semibold text-muted-foreground mb-2">未来 {data.forecast.length} 天</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.forecast.map((f, i) => {
                const FIcon = getWeatherIcon(f.weather_day)
                return (
                  <div key={i} className="flex-none w-[68px] bg-background rounded-lg p-2 text-center">
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

        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="mt-2.5">
            {data.alerts.map((a, i) => (
              <div key={i} className="rounded-lg p-2 mt-1.5 first:mt-0 border border-hsl(45,80%,50%,0.3) bg-hsl(45,80%,50%,0.08) text-[11px] text-foreground">
                ⚠️ {a.title || ''}<br />{a.text || ''}
              </div>
            ))}
          </div>
        )}
      </DialogBody>
    </>
  )
}

createRoot(document.getElementById('root')).render(<Card />)
