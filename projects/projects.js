import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let selectedYearLabel = null; 
let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

let sliceGenerator = d3.pie().value((d) => d.value);
let colors = d3.scaleOrdinal(d3.schemeTableau10); 

let query = '';
let projects = [];
const projectsContainer = document.querySelector('.projects');

function getArcData(projectsGiven) {
    let rolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    rolledData.sort((a,b)=>b[0]-a[0]);
    
    let data = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
    
    let arcData = sliceGenerator(data);
    return arcData;
}

function renderAll(projectsToRender) {
    const titleElement = document.querySelector('.projects-title');
    if (titleElement) {
        titleElement.textContent = `${projectsToRender.length} Projects`;
    }
    renderProjects(projectsToRender, projectsContainer, 'h2');
}

function renderPieChart(arcData) { 
    
    let arcs = arcData.map((d) => arcGenerator(d));

    const svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove(); 
    d3.select('.legend').selectAll('li').remove(); 

    svg.selectAll('path')
        .data(arcData) 
        .enter()
        .append('path')
        .attr('d', d => arcGenerator(d)) 
        .attr('fill', (d, idx) => colors(idx))
        .attr('class', (d) => (d.data.label === selectedYearLabel ? 'selected' : ''))
        .on('click', (event, d) => {
            
            const clickedLabel = d.data.label;
            selectedYearLabel = selectedYearLabel === clickedLabel ? null : clickedLabel;
            
            applyAllFilters();
        });

    let legend = d3.select('.legend');

    legend.selectAll('li')
        .data(arcData) 
        .enter()
        .append('li')
        .attr('class', (d) => `legend-item ${d.data.label === selectedYearLabel ? 'selected' : ''}`)
        .attr('style', (d, idx) => `--color:${colors(idx)}`) 
        .html((d) => `
          <span class="swatch"></span> 
          ${d.data.label} 
          <em>(${d.data.value})</em>
        `);
}

function applyAllFilters() {
    let combinedFilteredProjects = projects; 
    if (query) {
        combinedFilteredProjects = combinedFilteredProjects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query);
        });
    }
    let finalArcData = getArcData(combinedFilteredProjects);
    if (selectedYearLabel) { 
        combinedFilteredProjects = combinedFilteredProjects.filter(project => 
            project.year === selectedYearLabel
        );
    }
    renderAll(combinedFilteredProjects);
    renderPieChart(finalArcData);
}

const searchInput = document.querySelector('.searchBar');

if (searchInput) {
    searchInput.addEventListener('change', (event) => {
        
        query = event.target.value.toLowerCase();
        
        applyAllFilters();
    });
}

(async () => {
    try {
        let fetchedProjects = await fetchJSON('../lib/projects.json'); 
        
        projects = fetchedProjects || []; 

        applyAllFilters();

    } catch (error) {
        console.error("CRITICAL ERROR in projects.js:", error);
    }
})();