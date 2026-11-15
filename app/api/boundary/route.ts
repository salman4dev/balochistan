import {NextResponse} from 'next/server';
export const revalidate=86400;
export async function GET(){
 try{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),14000);
  try{
   const metadata=await fetch('https://www.geoboundaries.org/api/current/gbOpen/PAK/ADM1/',{signal:controller.signal,next:{revalidate:604800}});
   if(!metadata.ok)throw new Error('Boundary metadata unavailable');
   const info=await metadata.json();const url=info.simplifiedGeometryGeoJSON||info.gjDownloadURL;
   if(typeof url!=='string'||!url.startsWith('https://'))throw new Error('Missing geometry URL');
   const result=await fetch(url,{signal:controller.signal,next:{revalidate:604800}});
   if(!result.ok)throw new Error('Geometry unavailable');
   const collection=await result.json();
   const features=(collection.features||[]).filter((feature:{properties?:Record<string,unknown>})=>Object.values(feature.properties||{}).some(value=>typeof value==='string'&&/balochistan|baluchistan/i.test(value)));
   if(!features.length)throw new Error('Balochistan boundary not found');
   return NextResponse.json({type:'FeatureCollection',features,source:'geoBoundaries',license:info.boundaryLicense||'See geoBoundaries attribution'});
  }finally{clearTimeout(timeout);}
 }catch{return NextResponse.json({error:'Boundary temporarily unavailable'},{status:503});}
}
