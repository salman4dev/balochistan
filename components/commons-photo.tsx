'use client';
import {useEffect,useState} from 'react';
type PhotoItem={url:string;title:string;descriptionPage:string;license:string};
export default function Photo({query,alt}:{query:string;alt:string}){
 const [photo,setPhoto]=useState<PhotoItem|null>(null);
 useEffect(()=>{let active=true;fetch('/api/photos?q='+encodeURIComponent(query)).then(r=>r.json()).then(d=>{if(active)setPhoto(d.images?.[0]||null)}).catch(()=>{});return()=>{active=false}},[query]);
 return <div className="story-photo">{photo?<><img src={photo.url} alt={alt} loading="lazy"/><a href={photo.descriptionPage} target="_blank" rel="noopener noreferrer">Photo source · {photo.license} ↗</a></>:<div className="photo-fallback"><span>PHOTO COLLECTION</span><strong>{alt}</strong><small>Photo loading or unavailable</small></div>}</div>;
}
