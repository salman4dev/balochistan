import './guide.css';
import Link from 'next/link';
import Photo from '@/components/commons-photo';
import {topics} from '@/lib/balochistan-guide';

export const metadata={title:'Discover Balochistan | Balochistan Xplore',description:'Explore the geography, people, heritage, nature, tourism and culture of Balochistan through photographs and introductory guides.'};

// Search descriptions refer to real places and traditions in Balochistan.
// Wikimedia Commons links remain attached to each image for attribution.
const visuals:Record<string,{query:string;alt:string;caption:string}>={
 geography:{query:'Gwadar Balochistan Makran coastal landscape Pakistan',alt:'Coastal landscape of the Makran region of Balochistan',caption:'Makran coast · Land and sea'},
 people:{query:'Balochistan Pakistan traditional Balochi embroidery cultural dress',alt:'Traditional Balochi embroidery and cultural clothing',caption:'People · Language · Tradition'},
 history:{query:'Mehrgarh archaeological site Balochistan Pakistan',alt:'Mehrgarh archaeological heritage in Balochistan',caption:'Mehrgarh · Early heritage'},
 nature:{query:'Ziarat juniper forest Balochistan Pakistan',alt:'Juniper woodland and mountains in Ziarat, Balochistan',caption:'Ziarat · Juniper highlands'},
 economy:{query:'Turbat Kech Balochistan Pakistan dates palm',alt:'Date palm agriculture associated with the Kech region',caption:'Kech · Agriculture and livelihoods'},
 travel:{query:'Hingol National Park Balochistan Pakistan',alt:'Hingol National Park landscapes in Balochistan',caption:'Hingol · Places to discover'},
 food:{query:'Balochi sajji Pakistani roasted lamb traditional food',alt:'Sajji, a traditional roasted meat dish associated with Balochistan',caption:'Food · Shared traditions'},
 education:{query:'University of Turbat Balochistan Pakistan campus',alt:'University campus in Turbat, Balochistan',caption:'Learning · A growing future'}
};
export default function Discover(){
 return <main className="guide">
  <nav className="guide-nav" aria-label="Guide navigation"><Link href="/">← Interactive map</Link><span>BALOCHISTAN <b>XPLORE</b></span><Link href="/knowledge">Facts & universities ↗</Link></nav>
  <header className="guide-hero">
   <div className="guide-hero-copy"><div className="guide-kicker">A PHOTOGRAPHIC FIELD GUIDE / PAKISTAN</div><h1>Beyond the <em>map.</em></h1><p>Explore Balochistan through its people, dramatic landscapes, heritage and everyday life. Discover real places and follow their stories.</p><div className="guide-actions"><Link href="/">Open interactive atlas ↗</Link><a href="#topics">Explore eight themes ↓</a><Link href="/knowledge">Business, universities & facts ↗</Link></div><div className="guide-hero-note">REAL PLACES <span/> SOURCE-LINKED PHOTOGRAPHY <span/> EIGHT THEMES</div></div>
   <div className="guide-hero-visual"><Photo query="Gwadar Balochistan Pakistan Arabian Sea coastline" alt="Coastal landscape of Balochistan, Pakistan"/><div className="guide-hero-caption"><span>01 / EXPERIENCE THE LAND</span><strong>From the coast to the highlands</strong></div></div>
  </header>
  <section className="guide-index" id="topics"><div className="guide-section-head"><span>CHOOSE YOUR STORY</span><span>{topics.length} THEMES / BALOCHISTAN</span></div><div className="guide-grid">{topics.map(t=><div key={t.id} className="guide-topic-card"><Photo query={visuals[t.id].query} alt={visuals[t.id].alt}/><div className="guide-topic-copy"><span>{t.eyebrow}</span><strong>{t.title}</strong><a href={'#'+t.id} aria-label={'Explore '+t.title}>Explore this theme ↗</a></div></div>)}</div></section>
  <section className="guide-articles" aria-label="Discover Balochistan in depth">{topics.map((t,index)=><article id={t.id} key={t.id}><div className="guide-article-head"><span>{t.eyebrow}</span><h2>{t.title}</h2><p>{t.intro}</p><div className="guide-article-photo"><Photo query={visuals[t.id].query} alt={visuals[t.id].alt}/><div className="guide-photo-caption">{visuals[t.id].caption} <span>{String(index+1).padStart(2,'0')} / {String(topics.length).padStart(2,'0')}</span></div></div></div><div className="guide-article-content"><h3>Explore the topic</h3><ul>{t.facts.map(f=><li key={f}>{f}</li>)}</ul><div className="guide-sources">{t.links.map(l=><a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}</div><div className="guide-more"><Link href="/">Explore the interactive map ↗</Link></div></div></article>)}</section>
  <footer className="guide-footer"><p>Photographs are retrieved from Wikimedia Commons where available, with links to source and licensing information. Images illustrate the themes; exact locations and subjects are not independently verified. These short overviews are introductory, not exhaustive historical or demographic records.</p><Link href="/">Return to 3D atlas ↑</Link></footer>
 </main>
}
