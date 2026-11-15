import {NextRequest,NextResponse} from 'next/server';
export const revalidate=86400;
export async function GET(req:NextRequest){
 const term=(req.nextUrl.searchParams.get('q')||'Balochistan').slice(0,70);
 const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:'filetype:bitmap '+term,gsrnamespace:'6',gsrlimit:'8',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'800',format:'json',origin:'*'});
 try{
 const r=await fetch('https://commons.wikimedia.org/w/api.php?'+params.toString(),{next:{revalidate:86400},headers:{'User-Agent':'BalochistanXplore/1.0 (educational geographic explorer)'}});
 if(!r.ok)throw Error('Commons unavailable');
 const j=await r.json();
 const images=Object.values(j.query?.pages||{}).map((p:any)=>({title:p.title,url:p.imageinfo?.[0]?.thumburl||p.imageinfo?.[0]?.url,descriptionPage:p.imageinfo?.[0]?.descriptionurl,artist:p.imageinfo?.[0]?.extmetadata?.Artist?.value||'',license:p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value||'See image page'})).filter((x:any)=>x.url&&/^https:\/\//.test(x.url));
 return NextResponse.json({images,source:'Wikimedia Commons',note:'Image licenses and credits are shown on each image page'});
 }catch{return NextResponse.json({images:[],warning:'Photos temporarily unavailable'});}
}
