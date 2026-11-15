import {NextResponse} from 'next/server';
export const revalidate=86400;
type OsmElement={type:string;id:number;lat?:number;lon?:number;tags?:Record<string,string>};
const QUERY='[out:json][timeout:12];area["name"~"^(Balochistan|Baluchistan)$",i]["boundary"="administrative"]->.province;node["place"~"^(city|town|village|hamlet)$"](area.province);out body;';
const ENDPOINTS=['https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter'];
const headers={'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'};
export async function GET(){
 for(const endpoint of ENDPOINTS){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),14500);
  try{
   const response=await fetch(endpoint,{method:'POST',body:new URLSearchParams({data:QUERY}),signal:controller.signal,headers:{'Content-Type':'application/x-www-form-urlencoded'},next:{revalidate:86400}});
   if(!response.ok)continue;
   const data=await response.json();
   if(!Array.isArray(data.elements))continue;
   const seen=new Set<string>();
   const places=(data.elements as OsmElement[]).filter(p=>p.tags?.name&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)).map(p=>({id:'osm-'+p.id,name:p.tags!.name,kind:p.tags!.place,coordinates:[p.lon,p.lat],district:p.tags!['addr:district']||'',description:p.tags!.description||'',source:'OpenStreetMap'})).filter(p=>{const key=p.name.toLowerCase()+'|'+p.coordinates.join(',');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,12000);
   if(places.length)return NextResponse.json({places,count:places.length,source:'© OpenStreetMap contributors'},{headers});
  }catch{
   // Try the next independent public Overpass endpoint.
  }finally{clearTimeout(timeout);}
 }
 return NextResponse.json({places:[],count:0,warning:'Live settlement data is temporarily unavailable; curated destinations remain available.'},{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=900'}});
}
