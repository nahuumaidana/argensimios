'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

const cartasNegrasBase = [
  '¿Qué arruinó esta fiesta?',
  'Nunca voy a olvidar el primer día que probé ___',
  'Lo que más me excita es ___',
  'Mi talento oculto es ___',
  'En mi próxima vida quiero reencarnar como ___',
];

const cartasBlancasBase = [
  'Una paloma drogada',
  'Peronismo mágico',
  'Mi ex con una motosierra',
  'El peluca en cuero',
  'Un fernet sin gas',
  'Besar un sapo por la causa',
  'El olor a patria',
  'Una selfie con CFK',
  'Una empanada rellena de verdad',
  'Tirar un gas y culpar al perro',
];

export default function Sala() {
  const { codigo } = useParams();
  const nombreJugador = typeof window !== 'undefined' ? localStorage.getItem('nombreJugador') : null;
  const chatRef = useRef(null);

  const [jugadores, setJugadores] = useState([]);
  const [juez, setJuez] = useState('');
  const [cartaNegra, setCartaNegra] = useState('');
  const [fase, setFase] = useState('lobby');
  const [ronda, setRonda] = useState(1);
  const [rondaMax, setRondaMax] = useState(10);
  const [cartasMano, setCartasMano] = useState([]);
  const [cartasJugadas, setCartasJugadas] = useState([]);
  const [puntajes, setPuntajes] = useState({});
  const [ganadorFinal, setGanadorFinal] = useState('');  const [seleccion, setSeleccion] = useState('');
  useEffect(() => {
    if (!nombreJugador) return;

    const agregarJugador = async () => {
      const { data: existente } = await supabase
        .from('jugadores')
        .select('*')
        .eq('sala', codigo)
        .eq('nombre', nombreJugador);
      if (!existente?.length) {
        await supabase.from('jugadores').insert([{ sala: codigo, nombre: nombreJugador }]);
      }
    };

    agregarJugador();

    const sub = supabase
      .channel('jugadores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jugadores', filter: `sala=eq.${codigo}` }, async () => {
        const { data } = await supabase.from('jugadores').select('*').eq('sala', codigo);
        if (data) setJugadores(data.map(j => j.nombre));
      })
      .subscribe();

    const eliminar = async () => {
      await supabase.from('jugadores').delete().eq('sala', codigo).eq('nombre', nombreJugador);
    };

    window.addEventListener('beforeunload', eliminar);
    return () => {
      eliminar();
      window.removeEventListener('beforeunload', eliminar);
      supabase.removeChannel(sub);
    };
  }, [codigo, nombreJugador]);

  useEffect(() => {
    const subPartida = supabase
      .channel('partida')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas', filter: `sala=eq.${codigo}` }, async () => {
        const { data } = await supabase.from('partidas').select('*').eq('sala', codigo).single();
        if (data) {
          setCartaNegra(data.carta_negra || '');
          setJuez(data.juez || '');
          setFase(data.fase || 'lobby');
          setRonda(data.ronda || 1);
          setRondaMax(data.ronda_max || 10);
          setGanadorFinal(data.ganador_final || '');
        }
      })
      .subscribe();

    const cargarPartida = async () => {
      const { data } = await supabase.from('partidas').select('*').eq('sala', codigo).single();
      if (data) {
        setCartaNegra(data.carta_negra || '');
        setJuez(data.juez || '');
        setFase(data.fase || 'lobby');
        setRonda(data.ronda || 1);
        setRondaMax(data.ronda_max || 10);
        setGanadorFinal(data.ganador_final || '');
      }
    };

    cargarPartida();

    return () => {
      supabase.removeChannel(subPartida);
    };
  }, [codigo]);
  const iniciarPartida = async () => {
    const jugadoresActuales = await supabase
      .from('jugadores')
      .select('*')
      .eq('sala', codigo);
    const lista = jugadoresActuales?.data?.map(j => j.nombre) || [];

    const juezInicial = lista[0];
    const cartaNegraInicial = cartasNegrasBase[Math.floor(Math.random() * cartasNegrasBase.length)];

    await supabase.from('partidas').upsert({
      sala: codigo,
      juez: juezInicial,
      carta_negra: cartaNegraInicial,
      ronda: 1,
      ronda_max: 10,
      fase: 'jugando',
    });

    for (let jugador of lista) {
      await supabase.from('puntajes').upsert({ sala: codigo, jugador, puntos: 0 });
    }

    if (nombreJugador !== juezInicial) {
      const cartas = [...cartasBlancasBase].sort(() => 0.5 - Math.random()).slice(0, 5);
      setCartasMano(cartas);
    }
  };

  const jugarCarta = async (carta) => {
    if (fase !== 'jugando') return;
    const yaJugo = await supabase
      .from('jugadas')
      .select('*')
      .eq('sala', codigo)
      .eq('jugador', nombreJugador);
    if (yaJugo?.data?.length > 0) return;

    await supabase.from('jugadas').insert({ sala: codigo, jugador: nombreJugador, carta });
    setSeleccion(carta);
  };

  useEffect(() => {
    const canal = supabase
      .channel('jugadas-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jugadas', filter: `sala=eq.${codigo}` }, async () => {
        const { data } = await supabase.from('jugadas').select('*').eq('sala', codigo);
        setCartasJugadas(data);
      })
      .subscribe();

    const cargarJugadas = async () => {
      const { data } = await supabase.from('jugadas').select('*').eq('sala', codigo);
      setCartasJugadas(data);
    };
    cargarJugadas();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [codigo]);
  const elegirGanadora = async (ganadora) => {
    const jugadorGanador = cartasJugadas.find(j => j.carta === ganadora)?.jugador;
    if (!jugadorGanador) return;

    const puntajeActual = await supabase
      .from('puntajes')
      .select('*')
      .eq('sala', codigo)
      .eq('jugador', jugadorGanador)
      .single();

    const nuevosPuntos = (puntajeActual?.data?.puntos || 0) + 1;

    await supabase.from('puntajes').upsert({
      sala: codigo,
      jugador: jugadorGanador,
      puntos: nuevosPuntos,
    });

    const jugadoresActuales = await supabase
      .from('jugadores')
      .select('*')
      .eq('sala', codigo);
    const lista = jugadoresActuales?.data?.map(j => j.nombre) || [];

    const nuevoIndice = (lista.indexOf(juez) + 1) % lista.length;
    const nuevoJuez = lista[nuevoIndice];

    const cartaNueva = cartasNegrasBase[Math.floor(Math.random() * cartasNegrasBase.length)];
    const nuevaRonda = ronda + 1;

    const empates = await supabase
      .from('puntajes')
      .select('*')
      .eq('sala', codigo);

    const max = Math.max(...empates.data.map(e => e.puntos));
    const ganadores = empates.data.filter(e => e.puntos === max);

    if (nuevaRonda > rondaMax && ganadores.length === 1) {
      await supabase.from('partidas').update({
        fase: 'final',
        ganador_final: ganadores[0].jugador,
      }).eq('sala', codigo);
    } else {
      await supabase.from('partidas').update({
        juez: nuevoJuez,
        carta_negra: cartaNueva,
        ronda: nuevaRonda,
        fase: 'jugando',
      }).eq('sala', codigo);
    }

    await supabase.from('jugadas').delete().eq('sala', codigo);
    setSeleccion('');
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-orange-500 mb-4">Sala: {codigo}</h1>
      <h2 className="mb-2 text-lg">Jugador: {nombreJugador}</h2>

      {fase === 'lobby' && (
        <>
          <h3 className="text-xl text-orange-400 font-semibold mb-2">Esperando jugadores...</h3>
          <ul className="bg-gray-900 border border-orange-400 rounded-xl p-4 mb-6 w-full max-w-md shadow-lg">
            {jugadores.map((j, i) => (
              <li key={i} className="flex items-center mb-1">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                {j}
              </li>
            ))}
          </ul>
          {jugadores.length >= 2 && (
            <button
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow-md transition"
              onClick={iniciarPartida}
            >
              Iniciar partida
            </button>
          )}
        </>
      )}

      {fase === 'jugando' && (
        <>
          <h3 className="text-xl text-orange-400 mb-2">Ronda {ronda} / {rondaMax}</h3>
          <p className="mb-1">Juez actual: <strong className="text-orange-300">{juez}</strong></p>
          <p className="mb-4 text-center text-lg bg-orange-600 text-black p-3 rounded-xl">{cartaNegra}</p>

          {nombreJugador === juez ? (
            <>
              <h4 className="mb-2 text-lg text-green-400">Cartas jugadas:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {cartasJugadas.map((j, i) => (
                  <button
                    key={i}
                    onClick={() => elegirGanadora(j.carta)}
                    className="bg-orange-700 hover:bg-orange-800 text-black px-3 py-2 rounded-md"
                  >
                    {j.carta}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4 className="mb-2 text-lg text-green-400">Tu mano:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {cartasMano.map((carta, i) => (
                  <button
                    key={i}
                    onClick={() => jugarCarta(carta)}
                    disabled={!!seleccion}
                    className={`px-3 py-2 rounded-md ${seleccion === carta ? 'bg-green-500' : 'bg-white text-black'}`}
                  >
                    {carta}
                  </button>
                ))}
              </div>
              {seleccion && <p className="text-sm text-gray-400">Esperando que todos jueguen...</p>}
            </>
          )}
        </>
      )}

      {fase === 'final' && (
        <div className="text-center mt-10">
          <h2 className="text-3xl text-green-400 font-bold">¡Ganó {ganadorFinal}!</h2>
        </div>
      )}

      {/* Chat */}
    </main>
  );
}
