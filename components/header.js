import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex justify-center items-center p-4 border-b border-gray-700 bg-black">
      <Link href="/">
        <h1 className="text-2xl font-bold text-[#FF6F00]">ARGENSIMIOS</h1>
      </Link>
    </header>
  );
}
