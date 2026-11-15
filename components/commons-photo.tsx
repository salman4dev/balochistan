'use client';
import {useEffect,useRef,useState} from 'react';
type PhotoItem={url:string;title:string;descriptionPage:string;license:string};
type Result={images?:PhotoItem[]};
const photoCache=new Map<string,Promise<PhotoItem|null>>();
function getPhoto(query:string){
 let cached=photoCache.get(query);
 if(!cached){cached=fetch('/api/photos?q='+encodeURIComponent(query)).then(async response=>{if(!response.ok)return null;const data:Result=await response.json();return data.images?.find(item=>Boolean(item.url&&item.descriptionPage))||null;}).catch(()=>null);
 photoCache.set(query,cached);
 if(photoCache.size>120)photoCache.delete(photoCache.keys().next().value!);
 }
 return cached;
}
export default function Photo({query,alt}:{query:string;alt:string}){
 const ref=useRef<HTMLDivElement|null>(null);
 const [visible,setVisible]=useState(false);
 const [photo,setPhoto]=useState<PhotoItem|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{setVisible(false);setPhoto(null);setFailed(false);const node=ref.current;if(!node)return;
  if(!('IntersectionObserver' in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'350px'});
  observer.observe(node);return()=>observer.disconnect();
 },[query]);
 useEffect(()=>{if(!visible)return;let active=true;getPhoto(query).then(item=>{if(active)setPhoto(item)});return()=>{active=false}},[query,visible]);
 return <div className="story-photo" ref={ref}>
 {photo&&!failed?<><img src={photo.url} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/><a href={photo.descriptionPage} target="_blank" rel="noopener noreferrer">Photo source · {photo.license} ↗</a></>:<div className="photo-fallback"><span>{visible?'BALOCHISTAN PHOTOGRAPHY':'EXPLORE THE LAND'}</span><strong>{alt}</strong><small>{visible?'Image unavailable or loading':'Photo loads as you scroll'}</small></div>}
 </div>;
}
