class User {
    constructor(id, password, role, uid) {
        this.id = id;
        this.password = password;
        this.role = role;
        this.uid = uid;
    }
}

// Initialize local storage
if (!localStorage.getItem('users')) {
  console.log('Initializing users in local storage');
  localStorage.setItem('users', JSON.stringify([
    { id: 'admin1', password: 'admin123', role: 'Admin', uid: 'admin1' }
  ]));
}
if (!localStorage.getItem('projects')) {
  console.log('Initializing projects in local storage');
  localStorage.setItem('projects', JSON.stringify([]));
}
if (!localStorage.getItem('loginHistory')) {
  console.log('Initializing login history in local storage');
  localStorage.setItem('loginHistory', JSON.stringify([]));
}

function login() {
  console.log('Login button clicked');
  const userId = document.getElementById('user-id').value.trim();
  const password = document.getElementById('password').value;
  console.log('User ID entered:', userId);
  console.log('Password entered:', password);
  const users = JSON.parse(localStorage.getItem('users')) || [];
  console.log('Users in local storage:', users);
  const user = users.find(u => u.id === userId && u.password === password);
  if (user) {
    console.log('User found:', user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory')) || [];
    loginHistory.push({ userId: userId, timestamp: new Date().toISOString() });
    localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    console.log('Redirecting to dashboard.html');
    window.location.href = 'dashboard.html';
  } else {
    console.log('Login failed: Invalid ID or password');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = 'Invalid ID or password';
    errorMessage.classList.remove('hidden');
  }
}

function logout() {
  console.log('Logging out');
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded:', window.location.pathname);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser && !window.location.pathname.includes('index.html')) {
    console.log('No current user, redirecting to index.html');
    window.location.href = 'index.html';
    return;
  }
  if (window.location.pathname.includes('dashboard.html')) {
    console.log('Initializing dashboard for role:', currentUser.role);
    const addProjectForm = document.getElementById('add-project-form');
    const addUserSection = document.getElementById('add-user');
    const removeUserSection = document.getElementById('remove-user');
    const loginHistorySection = document.getElementById('login-history');
    
    if (currentUser.role === 'Admin') {
      console.log('Showing all sections for Admin');
      if (addProjectForm) addProjectForm.style.display = 'block';
      if (addUserSection) addUserSection.style.display = 'block';
      if (removeUserSection) addUserSection.style.display = 'block';
      if (loginHistorySection) loginHistorySection.style.display = 'block';
      loadUsers();
      loadLoginHistory();
    } else if (currentUser.role === 'Moderator') {
      console.log('Showing projects section for Moderator');
      if (addProjectForm) addProjectForm.style.display = 'block';
      if (addUserSection) addUserSection.style.display = 'none';
      if (removeUserSection) removeUserSection.style.display = 'none';
      if (loginHistorySection) loginHistorySection.style.display = 'none';
    } else {
      console.log('Showing projects section for General User');
      if (addProjectForm) addProjectForm.style.display = 'none';
      if (addUserSection) addUserSection.style.display = 'none';
      if (removeUserSection) removeUserSection.style.display = 'none';
      if (loginHistorySection) loginHistorySection.style.display = 'none';
    }
    loadProjects();
  }
});

function loadProjects() {
  console.log('Loading projects');
  const projectList = document.getElementById('project-list');
  if (!projectList) {
    console.log('Error: project-list element not found');
    return;
  }
  projectList.innerHTML = '';
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  console.log('Projects:', projects);
  if (projects && projects.length > 0) {
    projects.forEach(project => {
      const div = document.createElement('div');
      div.className = 'project-card';
      let html = `<h3 class="font-bold">${project.name}</h3>`;
      if (currentUser.role === 'Admin') {
        html += `<button onclick="removeProject('${project.id}')" class="bg-red-500 text-white px-2 py-1 rounded text-sm mb-2">Remove Project</button>`;
      }
      if (currentUser.role === 'Admin' || currentUser.role === 'Moderator') {
        html += `<button onclick="openModal('${project.id}')" class="bg-blue-500 text-white px-2 py-1 rounded text-sm mb-2 ml-2">Add File</button>`;
      }
      project.files.forEach(file => {
        html += `<p><a href="${file.link}" target="_blank" class="file-link text-blue-600">${file.name}</a></p>`;
      });
      div.innerHTML = html;
      projectList.appendChild(div);
    });
  } else {
    projectList.innerHTML = '<p>No projects found</p>';
  }
}

function addProject() {
  console.log('Adding project');
  const projectName = document.getElementById('project-name').value.trim();
  if (projectName) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectId = 'project' + Date.now();
    projects.push({
      id: projectId,
      name: projectName,
      files: [],
      createdBy: JSON.parse(localStorage.getItem('currentUser')).id,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('projects', JSON.stringify(projects));
    document.getElementById('project-name').value = '';
    loadProjects();
  } else {
    console.log('Project add failed: Missing project name');
    alert('Please enter a project name');
  }
}

function removeProject(projectId) {
  console.log('Removing project:', projectId);
  if (confirm('Are you sure you want to remove this project?')) {
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects = projects.filter(project => project.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
  }
}

function openModal(projectId) {
  console.log('Opening file modal for project:', projectId);
  document.getElementById('file-project-id').value = projectId;
  document.getElementById('file-name').value
