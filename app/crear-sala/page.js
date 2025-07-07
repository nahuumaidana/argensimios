'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CrearSala() {
  const [nombreJugador, setNombreJugador] = useState('');
  const [error, setError] = useState('');
  const [rondasSeleccionadas, setRondasSeleccionadas] = useState(10);
  const router = useRouter();

  const generarCodigo = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const handleCrearSala = async () => {
    setError('');

    if (!nombreJugador.trim()) {
      setError('Por favor ingresá tu nombre');
      return;
    }

    const codigo = generarCodigo();

    const { error: errorSala } = await supabase
      .from('partidas')
      .insert([
        {
          codigo,
          rondas_totales: rondasSeleccionadas,
          creador: nombreJugador
        }
      ]);

    if (errorSala) {
      console.error('Error Supabase:', errorSala.message || JSON.stringify(errorSala));
      setError('Error al crear la sala: ' + (errorSala?.message || 'Ver consola'));
      return;
    }

    await supabase.from('jugadores').insert([
      {
        nombre: nombreJugador,
        codigo_sala: codigo,
        puntos: 0
      }
    ]);

    router.push(`/sala/${codigo}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: 'white',
        padding: '2rem'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Crear Sala</h1>

      <input
        type="text"
        placeholder="Ingresá tu nombre"
        value={nombreJugador}
        onChange={(e) => setNombreJugador(e.target.value)}
        style={{
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #888',
          backgroundColor: '#111',
          color: 'white',
          width: '300px',
          marginBottom: '1rem',
          outline: 'none'
        }}
      />

      <select
        value={rondasSeleccionadas}
        onChange={(e) => setRondasSeleccionadas(Number(e.target.value))}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '6px',
          backgroundColor: '#222',
          color: 'white',
          border: '1px solid #888',
          width: '300px',
          marginBottom: '1rem',
          outline: 'none'
        }}
      >
        {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((r) => (
          <option key={r} value={r}>
            {r} rondas
          </option>
        ))}
      </select>

      {error && (
        <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.95rem' }}>{error}</p>
      )}

      <button
        onClick={handleCrearSala}
        style={{
          backgroundColor: '#FF5C00',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
      >
        Crear y entrar
      </button>
    </div>
  );
}
