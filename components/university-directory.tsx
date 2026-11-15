'use client';
import {useDeferredValue,useMemo,useState} from 'react';
import {Search,MapPin,GraduationCap,X,ArrowUpRight} from 'lucide-react';
import Link from 'next/link';
export type UniversityEntry={name:string;city:string;focus:string};
const atlasDestinations:Record<string,string>={Quetta:'quetta',Turbat:'turbat',Gwadar:'gwadar',Khuzdar:'khuzdar',Loralai:'loralai',Panjgur:'panjgur'};
export default function UniversityDirectory({universities,verificationUrl}:{universities:UniversityEntry[];verificationUrl:string}){
 const [query,setQuery]=useState('');
 const [location,setLocation]=useState('all');
 const deferredQuery=useDeferredValue(query);
 const cities=useMemo(()=>Array.from(new Set(universities.map(item=>item.city))).sort((a,b)=>a.localeCompare(b)),[universities]);
 const visible=useMemo(()=>{const text=deferredQuery.trim().toLocaleLowerCase();return universities.filter(item=>(location==='all'||item.city===location)&&(!text||(item.name+' '+item.city+' '+item.focus).toLocaleLowerCase().includes(text)));},[universities,deferredQuery,location]);
 return <div className="knowledge-directory">
  <div className="knowledge-directory-bar">
   <label className="knowledge-directory-search"><Search size={18} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search university, city or field..." aria-label="Search universities"/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Clear university search"><X size={17}/></button>}</label>
   <label className="knowledge-directory-select"><MapPin size={16} aria-hidden="true"/><span className="sr-only">Filter by city</span><select aria-label="Filter universities by city" value={location} onChange={event=>setLocation(event.target.value)}><option value="all">All cities</option>{cities.map(city=><option key={city} value={city}>{city}</option>)}</select></label>
  </div>
  <p className="knowledge-directory-count" aria-live="polite">Showing {visible.length} of {universities.length} listed institutions</p>
  <div className="knowledge-uni-grid">{visible.map((item,index)=><article key={item.name}><span>{String(index+1).padStart(2,'0')} / {item.city.toUpperCase()}</span><h3>{item.name}</h3><p>{item.focus}</p><div className="knowledge-uni-links"><a href={verificationUrl} target="_blank" rel="noopener noreferrer">Verify at HEC ↗</a>{atlasDestinations[item.city]?<Link href={"/?place="+atlasDestinations[item.city]} aria-label={"Explore "+item.city+" in Balochistan interactive atlas"}><MapPin size={13}/> Explore {item.city}<ArrowUpRight size={12}/></Link>:<a href={"https://www.openstreetmap.org/search?query="+encodeURIComponent(item.city+", Balochistan, Pakistan")} target="_blank" rel="noopener noreferrer"><MapPin size={13}/> View {item.city} on map ↗</a>}</div></article>)}</div>
  {visible.length===0&&<div className="knowledge-directory-empty"><GraduationCap size={25} aria-hidden="true"/><strong>No institutions found</strong><p>Try another name, field or city.</p><button type="button" onClick={()=>{setQuery('');setLocation('all')}}>Clear filters</button></div>}
 </div>;
}
