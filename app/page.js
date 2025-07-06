export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 pt-12 pb-16">
      <h1 className="text-5xl md:text-6xl font-bold text-[#FF6F00] mb-4">
        ARGENSIMIOS
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-8 text-center max-w-xl">
        El amigos de mierda Argentino para cagarte bien de risa.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <a
          href="/crear-sala"
          className="bg-[#FF6F00] hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-lg shadow-lg transition"
        >
          Crear Sala
        </a>
        <a
          href="/unirse-sala"
          className="bg-[#FF6F00] hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-lg shadow-lg transition"
        >
          Unirse a Sala
        </a>
      </div>
    </main>
  )
}
