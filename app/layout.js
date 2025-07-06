import './globals.css'
import Header from '../components/Header'

export const metadata = {
  title: 'Argensimios',
  description: 'Juego online inspirado en Cartas contra la humanidad',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
