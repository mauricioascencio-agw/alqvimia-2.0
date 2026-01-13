import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Usar el proxy de Vite (no especificar URL para usar el mismo origen)
    const socketInstance = io({
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Socket conectado:', socketInstance.id)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket desconectado')
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Error de conexión:', error)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [])

  const connect = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect()
    }
  }, [socket])

  const disconnect = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect()
    }
  }, [socket])

  const emit = useCallback((event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data)
    }
  }, [socket])

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      connect,
      disconnect,
      emit,
      on
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider')
  }
  return context
}
