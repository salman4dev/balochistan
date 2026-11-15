import type { Metadata } from 'next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';
export const metadata:Metadata={title:'Balochistan Xplore | Interactive 3D Atlas',description:'Explore Balochistan through an interactive 3D atlas, destinations, culture, history, stories and photography.',icons:{icon:'/icon.svg',shortcut:'/icon.svg',apple:'/balochistan-xplore-logo.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
