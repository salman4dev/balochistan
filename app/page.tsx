'use client';
import dynamic from 'next/dynamic';
import AtlasLoader from '@/components/atlas-loader';
const Explorer=dynamic(()=>import('@/components/explorer'),{ssr:false,loading:()=> <AtlasLoader/>});
export default function Home(){return <Explorer/>;}
