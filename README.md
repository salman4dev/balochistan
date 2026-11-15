# Balochistan Xplore

An interactive 3D geographic explorer for Balochistan, Pakistan.

## Included
- MapLibre interactive basemap, pitch, bearing, zoom, and optional raster DEM terrain
- Clickable Turbat, Gwadar and Quetta city markers with smooth fly-to movement
- Searchable city list, descriptions and local highlights
- Responsive dark interface with accessible controls and reduced-motion support
- City dataset tests with Vitest

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000. Run `npm test` for dataset checks and `npm run build` for a production build.

## Providers and notes
Basemap: OpenFreeMap and OpenStreetMap contributors. Terrain: public Mapterhorn DEM tile service (availability and usage restrictions may change). This project does not need an API key for its prototype.

3D means elevated terrain, not photorealistic city building models. If external terrain tiles fail the 2D map remains available. Three cities are curated in this initial release. More Balochistan cities and district boundaries require accurate data and verification.

### Deployment
Use Vercel for the simplest Next.js deployment or a compatible Cloudflare Next.js runtime. Public provider rate limits, reliability and attribution still apply.
