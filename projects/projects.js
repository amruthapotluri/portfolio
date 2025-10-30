import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects, BASE_PATH } from '../global.js';
let selectedIndex = -1; 
let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let colors = d3.scaleOrdinal(d3.schemeTableau10); 
let query = '';
let projects = [];
const projectsContainer = document.querySelector('.projects');

function renderAll(projectsToRender) {
    const titleElement = document.querySelector('.projects-title');
    if (titleElement) {
        titleElement.textContent = `${projectsToRender.length} Projects`;
    }
    renderProjects(projectsToRender, projectsContainer, 'h2');
}

function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    
    let data = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    const svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove(); 
    d3.select('.legend').html(''); 
    svg.selectAll('path')
        .data(arcData) 
        .enter()
        .append('path')
        .attr('d', d => arcGenerator(d)) 
        .attr('fill', (d, idx) => colors(idx))
        .attr('class', (d, idx) => (idx === selectedIndex ? 'selected' : ''))
        .on('click', (event, d) => {
            const clickedIndex = arcData.findIndex(a => a.data.label === d.data.label); 
            selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
            applyAllFilters();
        });
    let legend = d3.select('.legend');
    legend.selectAll('li')
        .data(arcData) 
        .enter()
        .append('li')
        .attr('class', (d, idx) => `legend-item ${idx === selectedIndex ? 'selected' : ''}`)
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

    if (selectedIndex !== -1) {
        let rolledData = d3.rollups(
          projects,
          (v) => v.length,
          (d) => d.year,
        );
        let data = rolledData.map(([year, count]) => {
          return { value: count, label: year };
        });
        let arcData = d3.pie().value((d) => d.value)(data);
        const selectedYear = arcData[selectedIndex].data.label;
        combinedFilteredProjects = combinedFilteredProjects.filter(project => 
            project.year === selectedYear
        );
    }
    renderAll(combinedFilteredProjects);
    renderPieChart(combinedFilteredProjects);
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
        let fetchedProjects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
        projects = fetchedProjects || []; 
        applyAllFilters();
    } catch (error) {
        console.error("CRITICAL ERROR in projects.js:", error);
    }
})();