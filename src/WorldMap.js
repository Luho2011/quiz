import React, {useEffect, useRef, useState, memo} from 'react'
import {geoEquirectangular, geoPath, geoDistance} from 'd3-geo'
import {zoom as d3zoom, zoomIdentity, zoomTransform} from 'd3-zoom'
import {select, pointer} from 'd3-selection'
import 'd3-transition'
import {feature, mesh} from 'topojson-client'
import world from 'world-atlas/countries-50m.json'
import './WorldMap.css'

// --- Karte einmalig berechnen (ohne Antarktis, ohne jede Beschriftung) ---
const LAT_TOP = 84;
const LAT_BOTTOM = -58;
const WIDTH = 1000;
const SCALE = WIDTH / (2 * Math.PI);
const HEIGHT = Math.round(SCALE * (LAT_TOP - LAT_BOTTOM) * Math.PI / 180);
const MAX_ZOOM = 40;

const projection = geoEquirectangular()
  .scale(SCALE)
  .translate([WIDTH / 2, SCALE * LAT_TOP * Math.PI / 180]);
const pathGen = geoPath(projection);

const countries = {
  ...world.objects.countries,
  geometries: world.objects.countries.geometries.filter(g => g.id !== '010'),
};
const LAND_PATH = pathGen(feature(world, countries));
const BORDER_PATH = pathGen(mesh(world, countries, (a, b) => a !== b));
const COAST_PATH = pathGen(mesh(world, countries, (a, b) => a === b));

// Entfernung zweier Punkte {lat, lon} in km (Großkreis)
export function distanceKm(a, b) {
  return geoDistance([a.lon, a.lat], [b.lon, b.lat]) * 6371;
}

export function formatKm(km) {
  return `${Math.round(km).toLocaleString('de-DE')} km`;
}

// Statische Kartenebenen – ändern sich nie, deshalb memo
const BaseLayers = memo(function BaseLayers() {
  return (
    <>
      <rect className='worldmap__ocean' x={-WIDTH} y={-HEIGHT} width={WIDTH * 3} height={HEIGHT * 3}/>
      <path className='worldmap__land' d={LAND_PATH}/>
      <path className='worldmap__border' d={BORDER_PATH}/>
      <path className='worldmap__coast' d={COAST_PATH}/>
    </>
  );
});

/**
 * Weltkarte mit Zoom (Pinch, Mausrad, Buttons) und optionalem Tippen.
 * - markers: [{lat, lon, color, label}]
 * - lines:   [{from: {lat, lon}, to: {lat, lon}, color}]
 * - onPick:  ({lat, lon}) => void   (nur wenn gesetzt, kann getippt werden)
 * - focus:   [{lat, lon}] -> Karte zoomt so, dass alle Punkte sichtbar sind; leer = ganze Welt
 * - resetKey: ändert sich -> Zoom zurücksetzen
 */
function WorldMap({markers = [], lines = [], onPick, focus, resetKey, className = ''}) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const [k, setK] = useState(1);

  useEffect(() => {
    const svg = select(svgRef.current);
    const z = d3zoom()
      .scaleExtent([1, MAX_ZOOM])
      .extent([[0, 0], [WIDTH, HEIGHT]])
      .translateExtent([[0, 0], [WIDTH, HEIGHT]])
      .on('zoom', (event) => {
        select(gRef.current).attr('transform', event.transform);
        setK(event.transform.k);
      });
    svg.call(z).on('dblclick.zoom', null);
    zoomRef.current = z;

    // Safari: Seiten-Zoom per Pinch auf der Karte verhindern
    const el = svgRef.current;
    const prevent = e => e.preventDefault();
    el.addEventListener('gesturestart', prevent);
    return () => {
      el.removeEventListener('gesturestart', prevent);
      svg.on('.zoom', null);
    };
  }, []);

  // Fokus / Reset
  const focusKey = JSON.stringify(focus || []);
  useEffect(() => {
    const z = zoomRef.current;
    if (!z) return;
    const points = JSON.parse(focusKey).map(p => projection([p.lon, p.lat]));
    let target = zoomIdentity;
    if (points.length > 0) {
      const xs = points.map(p => p[0]);
      const ys = points.map(p => p[1]);
      const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
      const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
      const scale = Math.max(1, Math.min(
        12,
        0.7 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT, 1e-6)
      ));
      target = zoomIdentity
        .translate(WIDTH / 2, HEIGHT / 2)
        .scale(scale)
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    }
    select(svgRef.current).transition().duration(points.length ? 1500 : 600).call(z.transform, target);
  }, [focusKey, resetKey]);

  const handleClick = (event) => {
    if (!onPick) return;
    const [px, py] = pointer(event, svgRef.current);
    const [x, y] = zoomTransform(svgRef.current).invert([px, py]);
    const [lon, lat] = projection.invert([x, y]);
    onPick({lat, lon});
  };

  const zoomBy = (factor) => {
    select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };
  const zoomReset = () => {
    select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, zoomIdentity);
  };

  return (
    <div className={`worldmap ${onPick ? 'worldmap--pickable' : ''} ${className}`}>
      <svg
        ref={svgRef}
        className='worldmap__svg'
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        onClick={handleClick}
      >
        <g ref={gRef}>
          <BaseLayers/>
          {lines.map((l, i) => (
            <path
              key={`l${i}`}
              className='worldmap__line'
              style={{stroke: l.color}}
              d={pathGen({type: 'LineString', coordinates: [[l.from.lon, l.from.lat], [l.to.lon, l.to.lat]]})}
            />
          ))}
          {markers.map((m, i) => {
            const [x, y] = projection([m.lon, m.lat]);
            return (
              <g key={`m${i}-${m.label || ''}`} className='worldmap__marker' transform={`translate(${x},${y}) scale(${1 / k})`}>
                <g className='worldmap__marker-inner'>
                  <circle r={5} style={{fill: m.color}}/>
                  <circle r={1.2} className='worldmap__marker-dot'/>
                  {m.label && <text y={-10} className='worldmap__marker-label' style={{fill: m.color}}>{m.label}</text>}
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      <div className='worldmap__controls'>
        <button type='button' onClick={() => zoomBy(2)} aria-label='Hineinzoomen'>+</button>
        <button type='button' onClick={() => zoomBy(0.5)} aria-label='Herauszoomen'>−</button>
        <button type='button' onClick={zoomReset} aria-label='Ganze Welt'>⟲</button>
      </div>
    </div>
  );
}

export default WorldMap
