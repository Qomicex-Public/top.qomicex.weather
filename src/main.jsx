import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

function Page() {
  useEffect(() => {
    document.body.style.cssText = 'margin:0;overflow:hidden;background:transparent;height:100%'
  }, [])
  return null
}

createRoot(document.getElementById('root')).render(<Page />)
