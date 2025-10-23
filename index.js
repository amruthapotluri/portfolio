document.addEventListener("DOMContentLoaded", async () => {
  
  try {
    const { fetchJSON, renderProjects, fetchGitHubData } = await import('./global.js');

    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');

    if (projectsContainer) {
      renderProjects(latestProjects, projectsContainer, 'h2');
    }

    const githubData = await fetchGitHubData('amruthapotluri');
    const profileStats = document.querySelector('#profile-stats');

    if (profileStats && githubData) {
      profileStats.innerHTML = `
            <dl>
              <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
              <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
              <dt>Followers:</dt><dd>${githubData.followers}</dd>
              <dt>Following:</dt><dd>${githubData.following}</dd>
            </dl>
        `;
    } else if (!githubData) {
      console.error("Failed to fetch GitHub data. githubData is undefined.");
    }

  } catch (error) {
    console.error("Failed to initialize page:", error);
  }

});