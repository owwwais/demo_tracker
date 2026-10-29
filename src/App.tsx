import { useEffect, useState } from 'react'
import { Landing } from './landing/Landing'
import { Demo } from './demo/Demo'

const routeOf = () => (window.location.hash.startsWith('#/demo') ? 'demo' : 'home')

export default function App() {
  const [route, setRoute] = useState(routeOf)
  useEffect(() => {
    const on = () => {
      const next = routeOf()
      setRoute((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    document.title = route === 'demo' ? 'الديمو التفاعلي — TRACKER' : 'TRACKER — عرض تجريبي'
  }, [route])
  return route === 'demo' ? <Demo /> : <Landing />
}
