import dynamic from 'next/dynamic';
const Explorer=dynamic(()=>import('@/components/explorer'),{ssr:false,loading:()=> <div className="loading">Loading Balochistan Xplore…</div>});
export default function Home(){return <Explorer/>}
