import { useState, useEffect } from 'react'

function ClockWidget({ configuracion }) {
  const { mensaje = 'Bienvenido a Alqvimia' } = configuracion || {}
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const dateStr = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  return (
    <div className="dc-clock">
      <div className="dc-clock-time">{timeStr}</div>
      <div className="dc-clock-date">{capitalizedDate}</div>
      {mensaje && <div className="dc-clock-message">{mensaje}</div>}
    </div>
  )
}

export default ClockWidget
