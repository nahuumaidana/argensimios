'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function SalaPage() {
  const { codigo } = useParams()
  const [jugador, setJugador] = useState('')
  const [jugadores, setJugadores] = useState([])
  const [chat, setChat] = useState([])
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const nombre = localStorage.getItem('nombre')
    setJugador(nombre)

    const cargarJugadores = async () => {
      const { data, error } = await supabase
        .from('jugadores')
        .select('*')
        .eq('sala', codigo)

      if (data) setJugadores(data)
    }

    const cargarChat = async () => {
      const { data, error } = await supabase
        .from('chat')
        .select('*')
        .eq('sala', codigo)
        .order('created_at', { ascending: true })

      if (data) setChat(data)
    }

    cargarJugadores()
    cargarChat()

    const canalJugadores = supabase
      .channel('jugadores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jugadores' },
        (payload) => {
          if (payload.new.sala === codigo) {
            cargarJugadores()
          }
        }
      )
      .subscribe()

    const canalChat = supabase
      .channel('chat')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat' },
        (payload) => {
          if (payload.new.sala === codigo) {
            setChat((prev) => [...prev, payload.new])
          }
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

    const { error } = await supabase.from('chat').insert([
      {
        sala: codigo,
        usuario: jugador,
        mensaje: mensaje,
      },
    ])

    if (!error) setMensaje('')
  }

  return (
    <main style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ color: 'orange' }}>Sala: {codigo}</h1>
      <h3>
        <span style={{ fontWeight: 'bold' }}>Jugador:</span> {jugador}
      </h3>
      <h3 style={{ color: 'orange' }}>Esperando jugadores...</h3>

      <div
        style={{
          margin: '10px auto',
          backgroundColor: '#1c2833',
          borderRadius: '10px',
          padding: '10px',
          width: '80%',
          maxWidth: '600px',
        }}
      >
        <h4 style={{ textAlign: 'left', color: 'white' }}>Jugadores conectados:</h4>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {jugadores.map((j) => (
            <li key={j.id} style={{ color: 'lightgreen' }}>
              {j.nombre}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          backgroundColor: '#0b1622',
          borderRadius: '10px',
          padding: '10px',
          marginTop: '10px',
          width: '80%',
          maxWidth: '600px',
        }}
      >
        <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
          {chat.map((c, i) => (
            <p key={i}>
              <strong>{c.usuario}:</strong> {c.mensaje}
            </p>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Escribí un mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '5px 0 0 5px',
              backgroundColor: '#1c2833',
              color: 'white',
            }}
          />
          <button
            onClick={enviarMensaje}
            style={{
              backgroundColor: 'orange',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '0 5px 5px 0',
              fontWeight: 'bold',
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </main>
  )
}
