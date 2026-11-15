'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import maplibregl,{type Map as MapType,type Marker} from 'maplibre-gl';
import {ArrowLeft,Compass,MapPin,Mountain,Search,X,ZoomIn,ZoomOut} from 'lucide-react';
import {cities,type City} from '@/lib/cities';

const CENTER:[number,number]=[65.4,28.2];
const reduceMotion=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export default function Explorer(){
 const mapNode=useRef<HTMLDivElement|null>(null);
 const map=useRef<MapType|null>(null);
 const markers=useRef<Marker[]>([]);
 const [selected,setSelected]=useState<City|null>(null);
 const [query,setQuery]=useState('');
 const [terrain,setTerrain]=useState<'loading'|'enabled'|'unavailable'>('loading');
 const [error,setError]=useState('');
 const flyToCity=useCallback((city:City)=>{setSelected(city);map.current?.flyTo({center:city.coordinates,zoom:9.2,pitch:64,bearing:-20,duration:reduceMotion()?0:1800,essential:false});},[]);
 const overview=useCallback(()=>{setSelected(null);map.current?.flyTo({center:CENTER,zoom:6.0,pitch:48,bearing:0,duration:reduceMotion()?0:1400,essential:false});},[]);
 useEffect(()=>{
  if(!mapNode.current||map.current)return;
  const instance=new maplibregl.Map({container:mapNode.current,style:'https://tiles.openfreemap.org/styles/dark',center:CENTER,zoom:6,pitch:48,bearing:0,maxPitch:80,attributionControl:true});
  map.current=instance;
  instance.addControl(new maplibregl.NavigationControl({showZoom:false,showCompass:true}),'bottom-right');
  const onError=(event:{error?:Error})=>{console.warn('Map resource error',event.error);setError('Some map tiles could not load. Check network access.');};
  instance.on('error',onError);
  instance.on('load',()=>{
   try{
    instance.addSource('terrain',{type:'raster-dem',url:'https://tiles.mapterhorn.com/tilejson.json',tileSize:512});
    instance.setTerrain({source:'terrain',exaggeration:1.25});
    setTerrain('enabled');
   }catch(err){console.warn('Terrain initialization failed',err);setTerrain('unavailable');}
  });
  for(const city of cities){
   const button=document.createElement('button');button.type='button';button.className='city-marker';
   button.setAttribute('aria-label','Explore '+city.name);
   const dot=document.createElement('span');dot.className='marker-dot';
   const label=document.createElement('span');label.className='marker-label';label.textContent=city.name;
   button.append(dot,label);
   button.addEventListener('click',()=>flyToCity(city));
   markers.current.push(new maplibregl.Marker({element:button,anchor:'bottom'}).setLngLat(city.coordinates).addTo(instance));
  }
  return()=>{markers.current.forEach(marker=>marker.remove());markers.current=[];instance.remove();map.current=null;};
 },[flyToCity]);
 const filtered=cities.filter(city=>(city.name+' '+city.district).toLowerCase().includes(query.trim().toLowerCase()));
 return <main className="shell">
  <div ref={mapNode} className="map" role="application" aria-label="Interactive map of Balochistan, Pakistan"/>
  <div className="vignette" aria-hidden="true"/>
  <header className="topbar"><button className="brand" onClick={overview} aria-label="Return to province overview"><span className="brand-icon"><Mountain size={22}/></span><span><strong>BALOCHISTAN</strong><small>XPLORE / 3D ATLAS</small></span></button><span className="top-pill"><span className="pulse"/> INTERACTIVE EXPLORER</span></header>
  <aside className="sidebar" aria-label="Explore destinations"><div className="eyebrow"><Compass size={14}/> DISCOVER THE UNDISCOVERED</div><h1>Explore<br/><em>Balochistan.</em></h1><p className="lead">A new perspective on Pakistan’s largest province. Discover places, landscapes and stories.</p>
   <label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search cities and districts" placeholder="Search city or district…" />{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
   <div className="section-heading"><span>FEATURED DESTINATIONS</span><span>{String(filtered.length).padStart(2,'0')}</span></div>
   <div className="city-list">{filtered.map((city,i)=><button key={city.id} className={'city-item'+(selected?.id===city.id?' active':'')} onClick={()=>flyToCity(city)} aria-pressed={selected?.id===city.id}><span className="city-index">{String(i+1).padStart(2,'0')}</span><span className="city-meta"><strong>{city.name}</strong><small>{city.district} District</small></span><MapPin size={18}/></button>)}{filtered.length===0&&<p className="empty">No matching city in the current preview.</p>}</div>
   <div className="sidebar-bottom"><span className="status-dot"/> {terrain==='enabled'?'3D terrain configured':terrain==='loading'?'Loading terrain…':'Terrain unavailable — map active'} · Free-first map</div>
  </aside>
  {selected&&<section className="detail" aria-label={selected.name+' information'}><div className="detail-head"><span className="eyebrow">CITY SPOTLIGHT / {selected.district.toUpperCase()}</span><button className="close" onClick={()=>setSelected(null)} aria-label="Close city details"><X size={18}/></button></div><div className="detail-art"><Mountain size={60} strokeWidth={1}/><span>DISCOVER / {selected.name.toUpperCase()}</span></div><h2>{selected.name}</h2><p className="district"><MapPin size={15}/> {selected.district} District · Balochistan, Pakistan</p><p className="description">{selected.description}</p><h3>Highlights</h3><div className="highlights">{selected.highlights.map(item=><span key={item}>{item}</span>)}</div><button className="back" onClick={overview}><ArrowLeft size={16}/> Back to province</button></section>}
  <div className="map-hint"><Compass size={15}/> Drag to explore · Scroll to zoom · Right-drag to tilt</div>
  <div className="zoom-tools"><button onClick={()=>map.current?.zoomIn({duration:reduceMotion()?0:300})} aria-label="Zoom in"><ZoomIn size={18}/></button><button onClick={()=>map.current?.zoomOut({duration:reduceMotion()?0:300})} aria-label="Zoom out"><ZoomOut size={18}/></button></div>
  {error&&<div className="error" role="status">{error}<button onClick={()=>setError('')} aria-label="Dismiss map warning"><X size={14}/></button></div>}
 </main>;
}
