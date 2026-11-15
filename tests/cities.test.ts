import {describe,it,expect} from 'vitest';
import {cities,findCity} from '../lib/cities';
describe('city data',()=>{
 it('has three unique places',()=>{expect(cities).toHaveLength(3);expect(new Set(cities.map(c=>c.id)).size).toBe(3)});
 it('keeps coordinates inside an expected Balochistan bounding region',()=>{for(const c of cities){expect(c.coordinates[0]).toBeGreaterThan(60);expect(c.coordinates[0]).toBeLessThan(70);expect(c.coordinates[1]).toBeGreaterThan(24);expect(c.coordinates[1]).toBeLessThan(32)}});
 it('has descriptive content for each city',()=>{for(const c of cities){expect(c.description.length).toBeGreaterThan(40);expect(c.highlights.length).toBeGreaterThan(0)}});
 it('finds Turbat',()=>expect(findCity('turbat')?.name).toBe('Turbat'));
});
