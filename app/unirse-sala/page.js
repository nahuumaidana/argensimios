'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnirseSala() {
  const [codigoSala, setCodigoSala] = useState('');
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!codigoSala.trim() || !nombre.trim()) return;

    // Guardar nombre del jugador
    localStorage.setItem('nombreJugador', nombre);

    // Redirigir a la sala
    router.push(`/sala/${codigoSala.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 pt-12 pb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-[#FF6F00] mb-6">
        Unirse a Sala
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className="px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6F00] shadow"
        />

        <input
          type="text"
          value={codigoSala}
          onChange={(e) => setCodigoSala(e.target.value)}
          placeholder="Código de sala"
          className="px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6F00] shadow"
        />

        <button
          type="submit"
          className="bg-[#FF6F00] hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-lg shadow-lg transition"
        >
          Unirse
        </button>
      </form>
    </main>
  );
}
