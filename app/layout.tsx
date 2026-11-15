import type { Metadata } from 'next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';
export const metadata:Metadata={title:'Balochistan Xplore | Interactive 3D Atlas',description:'Explore Balochistan through an interactive terrain atlas and discover Turbat, Gwadar and Quetta.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
