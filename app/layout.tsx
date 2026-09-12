import './globals.css';import {Fraunces,Plus_Jakarta_Sans} from 'next/font/google';import {Navbar} from '@/components/layout/Navbar';import {Footer} from '@/components/layout/Footer'
const fraunces=Fraunces({subsets:['latin'],variable:'--font-fraunces'});const jakarta=Plus_Jakarta_Sans({subsets:['latin'],variable:'--font-jakarta'})
export const metadata={title:'Rahat Luxury Apartment | Premium Short-Let in Lagos',description:'Luxury short-let apartments in Ikota GRA, Lagos.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}><body><Navbar/>{children}<Footer/></body></html>}
