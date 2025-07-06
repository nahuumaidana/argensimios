import Link from 'next/link';

export default function Create() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold text-[#FF6F00] mb-8">Crear Sala</h1>
      <p className="mb-4">Aquí vas a crear una nueva sala para tus amigos.</p>
      <Link href="/">
        <button className="bg-[#FF6F00] hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-lg shadow-lg transition">
          Volver al inicio
        </button>
      </Link>
    </main>
  )
}
