import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// Multiple metrics for the map slicer
const metrics: Record<string, Record<string, number>> = {
  population: {
    'Arunachal Pradesh': 142, 'Assam': 3120, 'Chandigarh': 1055, 'Chhattisgarh': 2560,
    'Delhi': 11034, 'Goa': 1458, 'Haryana': 5320, 'Himachal Pradesh': 683,
    'Jharkhand': 3290, 'Karnataka': 6110, 'Manipur': 254, 'Meghalaya': 297,
    'Mizoram': 109, 'Nagaland': 198, 'Punjab': 4985, 'Rajasthan': 6855,
    'Sikkim': 61, 'Tripura': 350, 'Uttarakhand': 1090, 'Telangana': 3946,
    'Andaman & Nicobar': 38, 'Bihar': 10400, 'Gujarat': 6034, 'Kerala': 3348,
    'Lakshadweep': 6, 'Madhya Pradesh': 7260, 'Odisha': 4190, 'Tamil Nadu': 7213,
    'Uttar Pradesh': 19953, 'West Bengal': 9130, 'Andhra Pradesh': 4966,
    'Puducherry': 124, 'Maharashtra': 11237, 'Daman & Diu': 24,
    'Dadra & Nagar Haveli': 34, 'Ladakh': 27, 'Jammu & Kashmir': 1254,
  },
  revenue: {
    'Arunachal Pradesh': 320, 'Assam': 1850, 'Chandigarh': 890, 'Chhattisgarh': 4100,
    'Delhi': 18500, 'Goa': 2300, 'Haryana': 7800, 'Himachal Pradesh': 1200,
    'Jharkhand': 3500, 'Karnataka': 15200, 'Manipur': 180, 'Meghalaya': 350,
    'Mizoram': 120, 'Nagaland': 160, 'Punjab': 6700, 'Rajasthan': 8900,
    'Sikkim': 95, 'Tripura': 280, 'Uttarakhand': 2100, 'Telangana': 12300,
    'Andaman & Nicobar': 45, 'Bihar': 5200, 'Gujarat': 14500, 'Kerala': 5800,
    'Lakshadweep': 12, 'Madhya Pradesh': 6800, 'Odisha': 3900, 'Tamil Nadu': 13800,
    'Uttar Pradesh': 16700, 'West Bengal': 8400, 'Andhra Pradesh': 7600,
    'Puducherry': 210, 'Maharashtra': 22000, 'Daman & Diu': 55,
    'Dadra & Nagar Haveli': 78, 'Ladakh': 30, 'Jammu & Kashmir': 1800,
  },
  orders: {
    'Arunachal Pradesh': 45, 'Assam': 520, 'Chandigarh': 310, 'Chhattisgarh': 680,
    'Delhi': 4200, 'Goa': 390, 'Haryana': 1450, 'Himachal Pradesh': 220,
    'Jharkhand': 580, 'Karnataka': 3100, 'Manipur': 35, 'Meghalaya': 60,
    'Mizoram': 25, 'Nagaland': 30, 'Punjab': 1200, 'Rajasthan': 1800,
    'Sikkim': 18, 'Tripura': 55, 'Uttarakhand': 410, 'Telangana': 2500,
    'Andaman & Nicobar': 12, 'Bihar': 980, 'Gujarat': 2800, 'Kerala': 1100,
    'Lakshadweep': 3, 'Madhya Pradesh': 1350, 'Odisha': 750, 'Tamil Nadu': 2900,
    'Uttar Pradesh': 3800, 'West Bengal': 1600, 'Andhra Pradesh': 1400,
    'Puducherry': 42, 'Maharashtra': 5100, 'Daman & Diu': 10,
    'Dadra & Nagar Haveli': 15, 'Ladakh': 8, 'Jammu & Kashmir': 280,
  },
  growth: {
    'Arunachal Pradesh': 12.5, 'Assam': 8.3, 'Chandigarh': 6.1, 'Chhattisgarh': 9.4,
    'Delhi': 4.2, 'Goa': 11.8, 'Haryana': 7.6, 'Himachal Pradesh': 10.2,
    'Jharkhand': 13.1, 'Karnataka': 9.8, 'Manipur': 15.3, 'Meghalaya': 14.7,
    'Mizoram': 16.2, 'Nagaland': 13.8, 'Punjab': 5.4, 'Rajasthan': 8.9,
    'Sikkim': 18.5, 'Tripura': 11.2, 'Uttarakhand': 10.8, 'Telangana': 12.1,
    'Andaman & Nicobar': 7.5, 'Bihar': 11.6, 'Gujarat': 8.7, 'Kerala': 6.8,
    'Lakshadweep': 5.2, 'Madhya Pradesh': 9.1, 'Odisha': 10.5, 'Tamil Nadu': 7.3,
    'Uttar Pradesh': 9.6, 'West Bengal': 7.1, 'Andhra Pradesh': 8.4,
    'Puducherry': 6.9, 'Maharashtra': 6.5, 'Daman & Diu': 14.1,
    'Dadra & Nagar Haveli': 13.5, 'Ladakh': 20.3, 'Jammu & Kashmir': 11.9,
  },
};

const metricLabels: Record<string, string> = {
  population: 'Population Index (thousands)',
  revenue: 'Revenue (₹ Cr)',
  orders: 'Order Count',
  growth: 'Growth (%)',
};

const metricColors: Record<string, (t: number) => string> = {
  population: d3.interpolateBlues,
  revenue: d3.interpolateGreens,
  orders: d3.interpolateOranges,
  growth: d3.interpolatePurples,
};

// Zone mapping
const zones: Record<string, string[]> = {
  north: ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Ladakh', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Chandigarh'],
  south: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry', 'Lakshadweep', 'Andaman & Nicobar'],
  east: ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal'],
  west: ['Goa', 'Gujarat', 'Maharashtra', 'Daman & Diu', 'Dadra & Nagar Haveli'],
  central: ['Chhattisgarh', 'Madhya Pradesh', 'Uttar Pradesh'],
  northeast: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'],
};

export async function renderIndiaMap(containerId: string) {
  const container = document.getElementById(containerId)!;
  container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Loading India Map...</div>';

  const selectedMetric = (document.getElementById('slicer-map-metric') as HTMLSelectElement).value || 'population';
  const selectedZone = (document.getElementById('slicer-map-zone') as HTMLSelectElement).value || '';

  const stateData = metrics[selectedMetric] || metrics.population;
  const zoneStates = selectedZone ? zones[selectedZone] || [] : [];

  const response = await fetch('/india-states.topo.json');
  const topoData = await response.json();
  const geoData = topojson.feature(topoData, topoData.objects.INDIA_STATES) as any;

  container.innerHTML = '';

  const width = container.clientWidth || 900;
  const height = Math.max(600, width * 0.85);

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('max-width', '100%')
    .style('height', 'auto');

  const projection = d3.geoMercator()
    .center([82, 22])
    .scale(width * 1.2)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const filteredValues = Object.entries(stateData)
    .filter(([name]) => !selectedZone || zoneStates.includes(name))
    .map(([, v]) => v);

  const colorInterpolator = metricColors[selectedMetric] || d3.interpolateBlues;
  const colorScale = d3.scaleSequential(colorInterpolator)
    .domain([0, d3.max(filteredValues) || 1]);

  // Tooltip
  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.85)')
    .style('color', '#fff')
    .style('padding', '8px 12px')
    .style('border-radius', '6px')
    .style('font-size', '0.8rem')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('transition', 'opacity 0.2s')
    .style('z-index', '100');

  // Draw states
  svg.selectAll('path')
    .data(geoData.features)
    .enter()
    .append('path')
    .attr('d', path as any)
    .attr('fill', (d: any) => {
      const name = d.properties.STNAME_SH;
      const inZone = !selectedZone || zoneStates.includes(name);
      if (!inZone) return '#f0f0f0';
      const val = stateData[name];
      return val != null ? colorScale(val) : '#eee';
    })
    .attr('stroke', (d: any) => {
      const name = d.properties.STNAME_SH;
      const inZone = !selectedZone || zoneStates.includes(name);
      return inZone ? '#fff' : '#ddd';
    })
    .attr('stroke-width', 0.8)
    .attr('opacity', (d: any) => {
      const name = d.properties.STNAME_SH;
      const inZone = !selectedZone || zoneStates.includes(name);
      return inZone ? 1 : 0.4;
    })
    .style('cursor', 'pointer')
    .on('mouseover', function (event: any, d: any) {
      d3.select(this).attr('stroke', '#0078d4').attr('stroke-width', 2.5);
      const name = d.properties.STNAME_SH;
      const val = stateData[name] ?? 'N/A';
      const suffix = selectedMetric === 'growth' ? '%' : '';
      tooltip
        .html(`<strong>${name}</strong><br/>${metricLabels[selectedMetric]}: <strong>${typeof val === 'number' ? val.toLocaleString() + suffix : val}</strong>`)
        .style('opacity', '1');
    })
    .on('mousemove', function (event: any) {
      const rect = container.getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - rect.left + 14) + 'px')
        .style('top', (event.clientY - rect.top - 35) + 'px');
    })
    .on('mouseout', function (_, d: any) {
      const name = (d as any).properties.STNAME_SH;
      const inZone = !selectedZone || zoneStates.includes(name);
      d3.select(this).attr('stroke', inZone ? '#fff' : '#ddd').attr('stroke-width', 0.8);
      tooltip.style('opacity', '0');
    });

  // State labels (only for states in selected zone or all if no zone)
  svg.selectAll('text.label')
    .data(geoData.features.filter((d: any) => !selectedZone || zoneStates.includes(d.properties.STNAME_SH)))
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', (d: any) => path.centroid(d)[0])
    .attr('y', (d: any) => path.centroid(d)[1])
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.3em')
    .style('font-size', '7px')
    .style('font-weight', '600')
    .style('fill', '#333')
    .style('pointer-events', 'none')
    .text((d: any) => d.properties.STNAME_SH);

  // Numeric value labels
  svg.selectAll('text.value-label')
    .data(geoData.features.filter((d: any) => !selectedZone || zoneStates.includes(d.properties.STNAME_SH)))
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', (d: any) => path.centroid(d)[0])
    .attr('y', (d: any) => path.centroid(d)[1])
    .attr('text-anchor', 'middle')
    .attr('dy', '0.8em')
    .style('font-size', '8px')
    .style('font-weight', '700')
    .style('fill', '#0078d4')
    .style('pointer-events', 'none')
    .text((d: any) => {
      const val = stateData[d.properties.STNAME_SH];
      const suffix = selectedMetric === 'growth' ? '%' : '';
      return val != null ? val.toLocaleString() + suffix : '';
    });

  // Legend
  const legendWidth = 200;
  const legendHeight = 12;
  const legendX = width - legendWidth - 30;
  const legendY = height - 50;
  const maxVal = d3.max(filteredValues) || 1;

  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient').attr('id', 'legend-gradient');
  gradient.append('stop').attr('offset', '0%').attr('stop-color', colorScale(0));
  gradient.append('stop').attr('offset', '100%').attr('stop-color', colorScale(maxVal));

  svg.append('rect')
    .attr('x', legendX).attr('y', legendY)
    .attr('width', legendWidth).attr('height', legendHeight)
    .attr('rx', 4)
    .style('fill', 'url(#legend-gradient)');

  svg.append('text').attr('x', legendX).attr('y', legendY - 5)
    .style('font-size', '9px').style('fill', '#666').text('0');
  svg.append('text').attr('x', legendX + legendWidth).attr('y', legendY - 5)
    .attr('text-anchor', 'end')
    .style('font-size', '9px').style('fill', '#666').text(maxVal.toLocaleString());
  svg.append('text').attr('x', legendX + legendWidth / 2).attr('y', legendY + legendHeight + 14)
    .attr('text-anchor', 'middle')
    .style('font-size', '10px').style('fill', '#333').style('font-weight', '600')
    .text(metricLabels[selectedMetric]);
}
