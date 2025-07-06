'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CrearSala() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [rondas, setRondas] = useState(10);

  const opcionesRondas = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  const handleCrear = () => {
    if (!nombre || !codigo || !rondas) return alert('Completá todos los campos');

    localStorage.setItem('nombreJugador', nombre);
    localStorage.setItem(`creador_${codigo}`, nombre);
    localStorage.setItem(`rondas_${codigo}`, rondas);
    router.push(`/sala/${codigo}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-3xl font-bold text-orange-500 mb-8">Crear Sala</h1>

      <input
        type="text"
        placeholder="Tu nombre"
        className="mb-4 px-4 py-2 rounded bg-white text-black"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Código de sala"
        className="mb-4 px-4 py-2 rounded bg-white text-black"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <select
        className="mb-6 px-4 py-2 rounded bg-white text-black"
        value={rondas}
        onChange={(e) => setRondas(Number(e.target.value))}
      >
        {opcionesRondas.map((num) => (
          <option key={num} value={num}>{num} rondas</option>
        ))}
      </select>

      <button
        onClick={handleCrear}
        className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-6 py-2 rounded"
      >
        Crear Sala
      </button>
    </main>
  );
}
