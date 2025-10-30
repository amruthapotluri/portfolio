console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/amruthapotluri', title: 'GitHub Profile' },
  { url: 'resume/', title: 'Résumé' }
];

export const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "/" : "/portfolio/";

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let title = p.title;
  let isExternal = p.url.startsWith('http');
  
  let url = isExternal ? p.url : BASE_PATH + p.url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  if (isExternal) {
    a.target = "_blank";
  }

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`
);

const select = document.querySelector('.color-scheme select');
const root = document.documentElement;

function setColorScheme(scheme) {
  root.style.setProperty('color-scheme', scheme);
  localStorage.colorScheme = scheme;
  select.value = scheme;
}

select.addEventListener('input', function (event) {
  const newScheme = event.target.value;
  setColorScheme(newScheme);
});

if (localStorage.colorScheme) {
  setColorScheme(localStorage.colorScheme);
}

const contactForm = document.querySelector('form');
contactForm?.addEventListener('submit', function (event) {
  event.preventDefault();
  const data = new FormData(contactForm);
  let urlParams = [];
  for (let [name, value] of data) {
    urlParams.push(`${name}=${encodeURIComponent(value)}`);
  }
  const mailtoUrl = `${contactForm.action}?${urlParams.join('&')}`;
  location.href = mailtoUrl;
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projectArray, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  for (const singleProject of projectArray) {
    const article = document.createElement('article');  
    article.innerHTML = `
      <${headingLevel}>${singleProject.title}</${headingLevel}>
      <img src="${singleProject.image}" alt="${singleProject.title}">
      <div class="project-content-footer"> 
          <p>${singleProject.description}</p>
          <span class="project-year">c. ${singleProject.year}</span>
      </div>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}