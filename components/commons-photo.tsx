'use client';
import {useEffect,useRef,useState} from 'react';
type PhotoItem={url:string;title:string;descriptionPage:string;license:string};
type Result={images?:PhotoItem[]};
type CachedPhoto={promise:Promise<PhotoItem|null>;expires:number};
const photoCache=new Map<string,CachedPhoto>();
function getPhoto(query:string){
 const existing=photoCache.get(query);
 if(existing&&existing.expires>Date.now())return existing.promise;
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),9000);
 const promise=fetch('/api/photos?q='+encodeURIComponent(query),{signal:controller.signal}).then(async response=>{
  if(!response.ok)return null;
  const data:Result=await response.json();
  return data.images?.find(item=>Boolean(item.url&&item.descriptionPage))||null;
 }).catch(()=>null).then(item=>{
  const entry=photoCache.get(query);
  if(entry&&entry.promise===promise)entry.expires=Date.now()+(item?24*60*60*1000:2*60*1000);
  return item;
 }).finally(()=>clearTimeout(timeout));
 photoCache.set(query,{promise,expires:Date.now()+30*1000});
 if(photoCache.size>120)photoCache.delete(photoCache.keys().next().value!);
 return promise;
}
export default function Photo({query,alt}:{query:string;alt:string}){
 const ref=useRef<HTMLDivElement|null>(null);
 const [visible,setVisible]=useState(false);
 const [photo,setPhoto]=useState<PhotoItem|null>(null);
 const [failed,setFailed]=useState(false);
 const [done,setDone]=useState(false);
 useEffect(()=>{setVisible(false);setPhoto(null);setFailed(false);setDone(false);const node=ref.current;if(!node)return;
  if(!('IntersectionObserver' in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'350px'});
  observer.observe(node);return()=>observer.disconnect();
 },[query]);
 useEffect(()=>{if(!visible)return;let active=true;getPhoto(query).then(item=>{if(active){setPhoto(item);setDone(true)}});return()=>{active=false}},[query,visible]);
 return <div className="story-photo" ref={ref}>
 {photo&&!failed?<><img src={photo.url} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/><a href={photo.descriptionPage} target="_blank" rel="noopener noreferrer">Photo source · {photo.license} ↗</a></>:<div className="photo-fallback"><span>{visible?'BALOCHISTAN PHOTOGRAPHY':'EXPLORE THE LAND'}</span><strong>{alt}</strong><small>{!visible?'Photo loads as you scroll':!done?'Finding a photograph…':'Photo unavailable'}</small></div>}
 </div>;
}
