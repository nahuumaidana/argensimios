'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Sala() {
  const { codigo } = useParams()
  const [jugadores, setJugadores] = useState([])
  const [nombreJugador, setNombreJugador] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mensajes, setMensajes] = useState([])
  const [error, setError] = useState('')
  const mensajesEndRef = useRef(null)

  // Al cargar: leer jugador desde localStorage y cargar jugadores
  useEffect(() => {
    const nombre = localStorage.getItem('nombreJugador')
    if (!nombre) {
      setError('No se encontró tu nombre. Volvé a crear o entrar a la sala.')
      return
    }
    setNombreJugador(nombre)

    const obtenerJugadores = async () => {
      const { data } = await supabase
        .from('jugadores')
        .select('*')
        .eq('codigo_sala', codigo)
      if (data) setJugadores(data)
    }

    const obtenerMensajes = async () => {
      const { data } = await supabase
        .from('chat')
        .select('*')
        .eq('codigo_sala', codigo)
        .order('created_at', { ascending: true })
      if (data) setMensajes(data)
    }

    obtenerJugadores()
    obtenerMensajes()
  }, [codigo])

  // Subscripciones en tiempo real a jugadores y chat
  useEffect(() => {
    const canalJugadores = supabase
      .channel(`jugadores-sala-${codigo}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jugadores', filter: `codigo_sala=eq.${codigo}` },
        (payload) => {
          supabase
            .from('jugadores')
            .select('*')
            .eq('codigo_sala', codigo)
            .then(({ data }) => setJugadores(data || []))
        }
      )
      .subscribe()

    const canalChat = supabase
      .channel(`chat-sala-${codigo}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat', filter: `codigo_sala=eq.${codigo}` },
        (payload) => {
          supabase
            .from('chat')
            .select('*')
            .eq('codigo_sala', codigo)
            .order('created_at', { ascending: true })
            .then(({ data }) => setMensajes(data || []))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalJugadores)
      supabase.removeChannel(canalChat)
    }
  }, [codigo])

  const enviarMensaje = async () => {
    if (mensaje.trim() === '') return
    await supabase.from('chat').insert([
      {
        codigo_sala: codigo,
        jugador: nombreJugador,
        mensaje,
      },
    ])
    setMensaje('')
  }

  // Scroll automático al nuevo mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-orange-500 mb-2">Sala: {codigo}</h1>
      <p className="mb-2">
        <strong>Jugador:</strong> {nombreJugador}
      </p>
      <p className="mb-4 text-orange-400 font-semibold">Esperando jugadores...</p>

      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-2xl mb-6">
        <p className="text-sm font-semibold mb-2">Jugadores conectados:</p>
        <ul className="list-disc ml-6">
          {jugadores.map((j) => (
            <li key={j.id}>{j.nombre}</li>
          ))}
        </ul>
      </div>

      {/* CHAT */}
      <div className="w-full max-w-2xl bg-[#0d1320] rounded-lg mb-4 flex flex-col" style={{ height: '300px' }}>
        <div className="flex-1 overflow-y-auto p-3">
          {mensajes.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong className="text-orange-500">{msg.jugador}:</strong> {msg.mensaje}
            </div>
          ))}
          <div ref={mensajesEndRef} />
        </div>
        <div className="flex border-t border-gray-700">
          <input
            type="text"
            placeholder="Escribí un mensaje..."
            className="flex-1 p-3 bg-gray-800 text-white"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
          />
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white px-4"
            onClick={enviarMensaje}
          >
            Enviar
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}
