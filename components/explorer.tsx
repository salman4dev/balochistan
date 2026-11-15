'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import maplibregl,{type Map as MapType,type Marker} from 'maplibre-gl';
import {ArrowLeft,Compass,MapPin,Mountain,Search,X,ZoomIn,ZoomOut,RotateCw,Layers,Pause,Play,Eye,Share2,Navigation,LocateFixed,SlidersHorizontal} from 'lucide-react';
import {cities,type City} from '@/lib/cities';

const CENTER:[number,number]=[65.4,28.2];
type Place={id:string;name:string;kind:string;coordinates:[number,number];district:string;description:string};
const asCity=(p:Place):City=>({id:p.id,name:p.name,district:p.district||'Balochistan',coordinates:p.coordinates,description:p.description||'Explore this settlement on the map. More verified local history, culture and landmarks will be added as sources become available.',highlights:[p.kind.charAt(0).toUpperCase()+p.kind.slice(1),'OpenStreetMap location']});

const reduceMotion=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export default function Explorer(){
 const mapNode=useRef<HTMLDivElement|null>(null);
 const map=useRef<MapType|null>(null);
 const markers=useRef<Marker[]>([]);
 const [selected,setSelected]=useState<City|null>(null);
 const [query,setQuery]=useState('');
 const [kindFilter,setKindFilter]=useState<'all'|'city'|'town'|'village'|'hamlet'>('all');
 const [showSettlements,setShowSettlements]=useState(true);
 const [showRelief,setShowRelief]=useState(true);
 const [mapPosition,setMapPosition]=useState({lat:28.2,lng:65.4,zoom:6});
 const [notice,setNotice]=useState('');
 const shareLocation=async()=>{const m=map.current;if(!m)return;const c=m.getCenter();const url=new URL(window.location.href);url.searchParams.set('lng',c.lng.toFixed(5));url.searchParams.set('lat',c.lat.toFixed(5));url.searchParams.set('z',m.getZoom().toFixed(1));url.searchParams.set('bearing',m.getBearing().toFixed(0));url.searchParams.set('pitch',m.getPitch().toFixed(0));try{await navigator.clipboard.writeText(url.toString());setNotice('Map view link copied');}catch{setNotice('Copy the URL from your address bar');}};

 const [places,setPlaces]=useState<Place[]>([]);
 const [placesStatus,setPlacesStatus]=useState('Loading mapped settlements…');
 const [boundaryStatus,setBoundaryStatus]=useState('Loading provincial boundary…');
 const placesRef=useRef<Place[]>([]);
 const boundaryRef=useRef<GeoJSON.FeatureCollection|null>(null);
 useEffect(()=>{
  let active=true;
  fetch('/api/places').then(r=>r.json()).then(data=>{if(!active)return;const result=Array.isArray(data.places)?data.places:[];placesRef.current=result;setPlaces(result);setPlacesStatus(result.length?result.length.toLocaleString()+' mapped settlements':'Live settlements unavailable');syncPlaces();}).catch(()=>{if(active)setPlacesStatus('Live settlements unavailable');});
  fetch('/api/boundary').then(r=>r.json()).then(data=>{if(!active)return;if(data.type==='FeatureCollection'){boundaryRef.current=data;setBoundaryStatus('Boundary loaded');syncBoundary();}else setBoundaryStatus('Boundary unavailable');}).catch(()=>{if(active)setBoundaryStatus('Boundary unavailable');});
  return()=>{active=false};
 },[]);
 const syncPlaces=()=>{
  const m=map.current;if(!m||!m.isStyleLoaded())return;
  const geojson:GeoJSON.FeatureCollection={type:'FeatureCollection',features:placesRef.current.filter(p=>showSettlements&&(kindFilter==='all'||p.kind===kindFilter)).map(p=>({type:'Feature',geometry:{type:'Point',coordinates:p.coordinates},properties:{id:p.id,name:p.name,kind:p.kind}}))};
  const source=m.getSource('settlements') as maplibregl.GeoJSONSource|undefined;
  if(source)source.setData(geojson);else m.addSource('settlements',{type:'geojson',data:geojson});
  if(!m.getLayer('settlement-dots'))m.addLayer({id:'settlement-dots',type:'circle',source:'settlements',paint:{'circle-radius':['interpolate',['linear'],['zoom'],5,1.6,8,3.5,11,5],'circle-color':['match',['get','kind'],'city','#ffb24c','town','#f1c475','village','#68d7d0','#66b6b3'],'circle-stroke-color':'#081925','circle-stroke-width':1,'circle-opacity':.85}});
  if(!m.getLayer('settlement-labels'))m.addLayer({id:'settlement-labels',type:'symbol',source:'settlements',minzoom:7,layout:{'text-field':['get','name'],'text-size':11,'text-offset':[0,1.2],'text-optional':true},paint:{'text-color':'#e6f8f5','text-halo-color':'#071a23','text-halo-width':1.5}});
 };
 useEffect(()=>{syncPlaces();},[kindFilter,showSettlements]);
 const syncBoundary=()=>{
  const m=map.current;if(!m||!m.isStyleLoaded()||!boundaryRef.current)return;
  const source=m.getSource('province') as maplibregl.GeoJSONSource|undefined;
  if(source)source.setData(boundaryRef.current);else m.addSource('province',{type:'geojson',data:boundaryRef.current});
  if(!m.getLayer('province-glow'))m.addLayer({id:'province-glow',type:'line',source:'province',paint:{'line-color':'#26d8e2','line-width':8,'line-opacity':.14,'line-blur':5}});
  if(!m.getLayer('province-outline'))m.addLayer({id:'province-outline',type:'line',source:'province',paint:{'line-color':'#64e3dd','line-width':2.2,'line-opacity':.9}});
 };

 const [terrain,setTerrain]=useState<'loading'|'enabled'|'unavailable'>('loading');
 const [error,setError]=useState('');
 const [orbit,setOrbit]=useState(false);
 const [tour,setTour]=useState(false);
 const [tourIndex,setTourIndex]=useState(0);
 const [terrainOn,setTerrainOn]=useState(true);
 const [styleMode,setStyleMode]=useState<'dark'|'light'|'satellite'>('dark');
 const [wireframe,setWireframe]=useState(false);
 const orbitRef=useRef(false);
 const terrainRef=useRef(true);
 useEffect(()=>{terrainRef.current=terrainOn;},[terrainOn]);
 useEffect(()=>{if(!tour)return;const id=window.setInterval(()=>setTourIndex(i=>(i+1)%cities.length),6500);return()=>window.clearInterval(id);},[tour]);
 useEffect(()=>{if(tour)flyToCityForTour(cities[tourIndex]);},[tour,tourIndex]);
 const flyToCityForTour=(city:City)=>{setSelected(city);map.current?.flyTo({center:city.coordinates,zoom:8.6,pitch:65,bearing:25,duration:reduceMotion()?0:2400,essential:false});};
 useEffect(()=>{orbitRef.current=orbit;},[orbit]);
 useEffect(()=>{
  if(!orbit)return;
  let frame=0;
  let last=0;
  const tick=(time:number)=>{
   if(!orbitRef.current||!map.current)return;
   if(last && !reduceMotion()){const dt=Math.min(time-last,100);map.current.rotateTo((map.current.getBearing()+dt*.006)%360,{duration:0});}
   last=time;frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[orbit]);
 const changeStyle=(next:'dark'|'light'|'satellite')=>{
  setOrbit(false);setStyleMode(next);
  const m=map.current;if(!m)return;
  m.setStyle(next==='satellite'?{version:8,sources:{imagery:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Imagery © Esri and contributors'}},layers:[{id:'satellite-imagery',type:'raster',source:'imagery'}]}:next==='dark'?'https://tiles.openfreemap.org/styles/dark':'https://tiles.openfreemap.org/styles/bright');
 };
 const toggleRelief=()=>{setShowRelief(v=>{const next=!v;const m=map.current;if(m?.getLayer('terrain-relief'))m.setLayoutProperty('terrain-relief','visibility',next?'visible':'none');return next;});};
 const toggleTerrain=()=>{setTerrainOn(prev=>{const next=!prev;const m=map.current;if(m&&m.getSource('terrain'))m.setTerrain(next?{source:'terrain',exaggeration:1.45}:null);return next;});};

 const flyToCity=useCallback((city:City)=>{setTour(false);setOrbit(false);setSelected(city);map.current?.flyTo({center:city.coordinates,zoom:9.2,pitch:64,bearing:-20,duration:reduceMotion()?0:1800,essential:false});},[]);
 const overview=useCallback(()=>{setTour(false);setOrbit(false);setSelected(null);map.current?.flyTo({center:CENTER,zoom:6.0,pitch:48,bearing:0,duration:reduceMotion()?0:1400,essential:false});},[]);
 useEffect(()=>{
  if(!mapNode.current||map.current)return;
  const params=new URLSearchParams(window.location.search);
  const num=(key:string,fallback:number,min:number,max:number)=>{const n=Number(params.get(key));return params.has(key)&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};
  const instance=new maplibregl.Map({container:mapNode.current,style:'https://tiles.openfreemap.org/styles/dark',center:[num('lng',CENTER[0],60,71),num('lat',CENTER[1],24,33)],zoom:num('z',6,3,16),pitch:num('pitch',48,0,80),bearing:num('bearing',0,-360,360),maxPitch:80,attributionControl:{}});
  map.current=instance;
  instance.addControl(new maplibregl.NavigationControl({showZoom:false,showCompass:true}),'bottom-right');
  const onError=(event:{error?:Error})=>{console.warn('Map resource error',event.error);setError('Some map tiles could not load. Check network access.');};
  instance.on('error',onError);
  instance.on('moveend',()=>{const c=instance.getCenter();setMapPosition({lat:c.lat,lng:c.lng,zoom:instance.getZoom()});});
  instance.on('style.load',()=>{
   syncBoundary();syncPlaces();
   try{
    if(instance.getSource('terrain'))return;
    instance.addSource('terrain',{type:'raster-dem',url:'https://tiles.mapterhorn.com/tilejson.json',tileSize:512});
    instance.setTerrain(terrainRef.current?{source:'terrain',exaggeration:1.45}:null);
    instance.addSource('relief-dem',{type:'raster-dem',url:'https://tiles.mapterhorn.com/tilejson.json',tileSize:512});
    instance.addLayer({id:'terrain-relief',type:'hillshade',source:'relief-dem',layout:{visibility:'visible'},paint:{'hillshade-exaggeration':.55,'hillshade-shadow-color':'#1c2930','hillshade-highlight-color':'#d6c49d','hillshade-accent-color':'#aa7855'}});
    setTerrain('enabled');
   }catch(err){console.warn('Terrain initialization failed',err);setTerrain('unavailable');}
  });
  instance.on('click','settlement-dots',event=>{const id=event.features?.[0]?.properties?.id;const p=placesRef.current.find(place=>place.id===id);if(p)flyToCity(asCity(p));});
  instance.on('mouseenter','settlement-dots',()=>{instance.getCanvas().style.cursor='pointer'});
  instance.on('mouseleave','settlement-dots',()=>{instance.getCanvas().style.cursor=''});
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
 const filtered=[...cities.filter(c=>kindFilter==='all'||kindFilter==='city'),...places.filter(p=>(kindFilter==='all'||p.kind===kindFilter)&&!cities.some(c=>c.name.toLowerCase()===p.name.toLowerCase())).map(asCity)].filter(city=>(city.name+' '+city.district).toLowerCase().includes(query.trim().toLowerCase())).slice(0,70);
 return <main className="shell">
  <div ref={mapNode} className="map" role="application" aria-label="Interactive map of Balochistan, Pakistan"/>
  <div className="vignette" aria-hidden="true"/>
  {wireframe&&<div className="wireframe-glow" aria-hidden="true"/>}
  <div className="atlas-topline" aria-hidden="true"/>
  <header className="topbar"><button className="brand" onClick={overview} aria-label="Return to province overview"><span className="brand-icon"><Mountain size={22}/></span><span><strong>BALOCHISTAN</strong><small>XPLORE / 3D ATLAS</small></span></button><span className="top-pill"><span className="pulse"/> INTERACTIVE EXPLORER</span></header>
  <div className="atlas-coordinate" aria-live="off"><Navigation size={13}/><span>{mapPosition.lat.toFixed(3)}° N &nbsp; {mapPosition.lng.toFixed(3)}° E</span><span className="coord-divider"/> ZOOM {mapPosition.zoom.toFixed(1)}</div>
  <aside className="sidebar" aria-label="Explore destinations"><div className="eyebrow"><Compass size={14}/> DISCOVER THE UNDISCOVERED</div><h1>Explore<br/><em>Balochistan.</em></h1><p className="lead">A new perspective on Pakistan’s largest province. Discover places, landscapes and stories.</p>
   <label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search cities and districts" placeholder="Search city or district…" />{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
   <div className="place-filters" role="group" aria-label="Filter settlement types">{(['all','city','town','village','hamlet'] as const).map(kind=><button key={kind} aria-pressed={kindFilter===kind} className={kindFilter===kind?'active':''} onClick={()=>setKindFilter(kind)}>{kind==='all'?'All places':kind.charAt(0).toUpperCase()+kind.slice(1)+'s'}</button>)}</div>
   <div className="section-heading"><span>CITIES, TOWNS & VILLAGES</span><span>{String(filtered.length).padStart(2,'0')}</span></div>
   <div className="city-list">{filtered.map((city,i)=><button key={city.id} className={'city-item'+(selected?.id===city.id?' active':'')} onClick={()=>flyToCity(city)} aria-pressed={selected?.id===city.id}><span className="city-index">{String(i+1).padStart(2,'0')}</span><span className="city-meta"><strong>{city.name}</strong><small>{city.district} District</small></span><MapPin size={18}/></button>)}{filtered.length===0&&<p className="empty">No matching settlement in the available dataset.</p>}</div>
   <div className="sidebar-bottom"><span className="status-dot"/> {placesStatus} · {boundaryStatus} · {terrain==='enabled'?'3D terrain on':terrain==='loading'?'Loading terrain':'Terrain unavailable'}</div>
  </aside>
  {selected&&<section className="detail" aria-label={selected.name+' information'}><div className="detail-head"><span className="eyebrow">DESTINATION PROFILE / {selected.district.toUpperCase()}</span><button className="close" onClick={()=>setSelected(null)} aria-label="Close city details"><X size={18}/></button></div><div className="detail-art"><Mountain size={60} strokeWidth={1}/><span>DISCOVER / {selected.name.toUpperCase()}</span></div><h2>{selected.name}</h2><p className="district"><MapPin size={15}/> {selected.district} District · Balochistan, Pakistan</p><p className="description">{selected.description}</p>{selected.region&&<div className="destination-facts"><div><span>REGION</span><strong>{selected.region}</strong></div><div><span>LANDSCAPE</span><strong>{selected.landscape}</strong></div><div><span>CULTURE</span><strong>{selected.culture}</strong></div></div>}{selected.places&&<><h3>Places to discover</h3><ul className="destination-places">{selected.places.map(place=><li key={place}>{place}</li>)}</ul></>}<h3>Highlights</h3><div className="highlights">{selected.highlights.map(item=><span key={item}>{item}</span>)}</div>{selected.sourceUrl&&<a className="destination-source" href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">Explore reference information ↗</a>}<button className="back" onClick={overview}><ArrowLeft size={16}/> Back to province</button></section>}
  <section className="explore-controls" aria-label="3D exploration controls">
   <div className="control-title"><Layers size={15}/> EXPLORE IN 3D <span className="control-live">360°</span></div>
   <div className="control-row"><span>Map style</span><div className="control-segment"><button aria-pressed={styleMode==='dark'} className={styleMode==='dark'?'chosen':''} onClick={()=>changeStyle('dark')}>Night</button><button aria-pressed={styleMode==='light'} className={styleMode==='light'?'chosen':''} onClick={()=>changeStyle('light')}>Day</button><button aria-pressed={styleMode==='satellite'} className={styleMode==='satellite'?'chosen':''} onClick={()=>changeStyle('satellite')}>Satellite</button></div></div>
   <div className="control-row"><span>Real 3D terrain</span><button className={'control-switch'+(terrainOn?' on':'')} role="switch" aria-checked={terrainOn} aria-label="Toggle 3D terrain" onClick={toggleTerrain}><span/></button></div>
   <div className="control-row"><span>Terrain shading</span><button className={'control-switch'+(showRelief?' on':'')} role="switch" aria-checked={showRelief} aria-label="Toggle terrain shading" onClick={toggleRelief}><span/></button></div>
   <div className="control-row"><span>Settlement markers</span><button className={'control-switch'+(showSettlements?' on':'')} role="switch" aria-checked={showSettlements} aria-label="Toggle settlement markers" onClick={()=>setShowSettlements(v=>!v)}><span/></button></div>
   <div className="control-row"><span>Neon atmosphere</span><button className={'control-switch'+(wireframe?' on':'')} role="switch" aria-checked={wireframe} aria-label="Toggle neon overlay" onClick={()=>setWireframe(v=>!v)}><span/></button></div>
   <button className="orbit-button" aria-pressed={orbit} onClick={()=>{setTour(false);setOrbit(v=>!v);}}>{orbit?<Pause size={16}/>:<RotateCw size={16}/>} {orbit?'Pause 360° orbit':'Start 360° orbit'}</button>
   <button className="tour-button" aria-pressed={tour} onClick={()=>{setOrbit(false);setTour(v=>{if(!v)setTourIndex(0);return !v;});}}>{tour?<Pause size={16}/>:<Play size={16}/>} {tour?'Stop guided city tour':'Tour Turbat · Gwadar · Quetta'}</button>
   <button className="share-map" onClick={shareLocation}><Share2 size={15}/> Copy shareable map view</button>
   <div className="control-actions"><button onClick={()=>{setOrbit(false);map.current?.easeTo({pitch:75,bearing:map.current.getBearing(),duration:reduceMotion()?0:900})}}><Eye size={15}/> Tilt view</button><button onClick={overview}><Compass size={15}/> Reset</button></div>
  </section>
  <div className="map-hint"><Compass size={15}/> Drag to explore · Scroll to zoom · Right-drag to tilt</div>
  <div className="zoom-tools"><button onClick={()=>map.current?.zoomIn({duration:reduceMotion()?0:300})} aria-label="Zoom in"><ZoomIn size={18}/></button><button onClick={()=>map.current?.zoomOut({duration:reduceMotion()?0:300})} aria-label="Zoom out"><ZoomOut size={18}/></button></div>
  {notice&&<div className="atlas-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss message"><X size={14}/></button></div>}
  {error&&<div className="error" role="status">{error}<button onClick={()=>setError('')} aria-label="Dismiss map warning"><X size={14}/></button></div>}
 </main>;
}
