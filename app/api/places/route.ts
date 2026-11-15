import {NextResponse} from 'next/server';
export const revalidate=86400;
type OsmElement={type:string;id:number;lat?:number;lon?:number;center?:{lat:number;lon:number};tags?:Record<string,string>};
export async function GET(){
 const query='[out:json][timeout:35];area["name"~"^(Balochistan|Baluchistan)$",i]["boundary"="administrative"]->.province;(node["place"~"^(city|town|village|hamlet)$"](area.province););out body;';
 try{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),40000);
  try{
   const response=await fetch('https://overpass.kumi.systems/api/interpreter',{method:'POST',body:new URLSearchParams({data:query}),signal:controller.signal,headers:{'Content-Type':'application/x-www-form-urlencoded'},next:{revalidate:86400}});
   if(!response.ok)throw new Error('OSM unavailable');
   const data=await response.json();
   const places=(data.elements as OsmElement[]||[]).filter(p=>p.tags?.name&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)).slice(0,12000).map(p=>({id:'osm-'+p.id,name:p.tags!.name,kind:p.tags!.place,coordinates:[p.lon,p.lat],district:p.tags!['addr:district']||'',description:p.tags!.description||'',source:'OpenStreetMap'}));
   return NextResponse.json({places,count:places.length,source:'© OpenStreetMap contributors'});
  }finally{clearTimeout(timeout);}
 }catch{return NextResponse.json({places:[],count:0,warning:'Live settlement data is temporarily unavailable'},{status:200});}
}
