import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning,
  CloudSnow, Snowflake, CloudFog, Wind, CloudSun,
  Thermometer, Droplets, Eye, Gauge, SunDim, Umbrella,
} from 'lucide-react'

const codeMap = {
  100: Sun,
  101: CloudSun,
  102: Cloud,
  103: Cloud,
  104: Cloud,
  200: CloudLightning, 201: CloudLightning, 202: CloudLightning, 203: CloudLightning, 204: CloudLightning,
  300: CloudDrizzle, 301: CloudDrizzle, 302: CloudRain, 303: CloudRain,
  304: CloudRain, 305: CloudRain, 306: CloudRain, 307: CloudRain,
  308: CloudRain, 309: CloudDrizzle, 310: CloudRain, 311: CloudRain,
  312: CloudRain, 313: CloudRain, 314: CloudRain, 315: CloudRain,
  316: CloudRain, 317: CloudRain, 318: CloudRain,
  400: CloudSnow, 401: CloudSnow, 402: Snowflake, 403: Snowflake,
  404: CloudSnow, 405: CloudSnow, 406: Snowflake, 407: Snowflake,
  408: Snowflake, 409: CloudSnow, 410: Snowflake,
  500: CloudFog, 501: CloudFog, 502: CloudFog, 503: CloudFog, 504: CloudFog,
  507: CloudFog, 508: CloudFog,
  900: Thermometer,
}

const textMap = [
  [/晴/, Sun],
  [/多云/, CloudSun],
  [/阴/, Cloud],
  [/小雨|毛毛雨/, CloudDrizzle],
  [/中雨|阵雨/, CloudRain],
  [/大雨|暴雨/, Umbrella],
  [/雷阵雨/, CloudLightning],
  [/雨夹雪/, CloudSnow],
  [/小雪/, CloudSnow],
  [/中雪/, Snowflake],
  [/大雪|暴雪/, Snowflake],
  [/雾|霾|烟/, CloudFog],
  [/沙尘/, CloudFog],
  [/风/, Wind],
]

export function getWeatherIcon(codeOrText) {
  const s = String(codeOrText || '')
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10)
    if (codeMap[n]) return codeMap[n]
  }
  for (const [re, Icon] of textMap) {
    if (re.test(s)) return Icon
  }
  return Thermometer
}

export const dataIcons = {
  feels_like: Thermometer,
  humidity: Droplets,
  wind_direction: Wind,
  wind_power: Wind,
  visibility: Eye,
  pressure: Gauge,
  uv: SunDim,
  precipitation: CloudRain,
}
