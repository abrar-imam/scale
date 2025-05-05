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
  const userId = document.getElementById('user-id').value;
  const password = document.getElementById('password').value;
  console.log('User ID entered:', userId);
  console.log('Password entered:', password);
  const users = JSON.parse(localStorage.getItem('users'));
  console.log('Users in local storage:', users);
  const user = users.find(u => u.id === userId && u.password === password);
  if (user) {
    console.log('User found:', user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory'));
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
    if (currentUser.role === 'Admin') {
      console.log('Showing admin navigation');
      document.getElementById('admin-nav').classList.remove('hidden');
    } else if (currentUser.role === 'Moderator') {
      console.log('Showing moderator navigation');
      document.getElementById('moderator-nav').classList.remove('hidden');
    } else {
      console.log('Showing general user navigation');
      document.getElementById('general-nav').classList.remove('hidden');
    }
    showSection('add-user');
  }
  if (window.location.pathname.includes('projects.html')) {
    if (currentUser.role === 'Admin' || currentUser.role === 'Moderator') {
      document.getElementById('add-project-form').classList.remove('hidden');
    }
    loadProjects();
  }
});

function showSection(sectionId) {
  console.log('Showing section:', sectionId);
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

function loadProjects() {
  console.log('Loading projects');
  const projectList = document.getElementById('project-list');
  projectList.innerHTML = '';
  const projects = JSON.parse(localStorage.getItem('projects'));
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  console.log('Projects:', projects);
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
}

function addProject() {
  console.log('Adding project');
  const projectName = document.getElementById('project-name').value;
  if (projectName) {
    const projects = JSON.parse(localStorage.getItem('projects'));
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
  }
}

function removeProject(projectId) {
  console.log('Removing project:', projectId);
  if (confirm('Are you sure you want to remove this project?')) {
    let projects = JSON.parse(localStorage.getItem('projects'));
    projects = projects.filter(project => project.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
  }
}

function openModal(projectId) {
  console.log('Opening file modal for project:', projectId);
  document.getElementById('file-project-id').value = projectId;
  document.getElementById('file-name').value = '';
  document.getElementById('file-link').value = '';
  document.getElementById('file-modal').classList.remove('hidden');
}

function closeModal() {
  console.log('Closing file modal');
  document.getElementById('file-modal').classList.add('hidden');
}

function addFile() {
  console.log('Adding file');
  const projectId = document.getElementById('file-project-id').value;
  const fileName = document.getElementById('file-name').value;
  const fileLink = document.getElementById('file-link').value;
  if (fileName && fileLink) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.files.push({ name: fileName, link: fileLink });
      localStorage.setItem('projects', JSON.stringify(projects));
      closeModal();
      loadProjects();
    }
  } else {
    console.log('File add failed: Missing file name or link');
  }
}

function addUser() {
  console.log('Adding user');
  const userId = document.getElementById('new-user-id').value;
  const password = document.getElementById('new-user-password').value;
  const role = document.getElementById('new-user-role').value;
  if (userId && password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const uid = 'user' + Date.now();
    users.push({ id: userId, password, role, uid });
    localStorage.setItem('users', JSON.stringify(users));
    alert('User added successfully');
    loadUsers();
  } else {
    alert('Please enter ID and password');
  }
}

function loadUsers() {
  console.log('Loading users');
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  const users = JSON.parse(localStorage.getItem('users'));
  console.log('Users:', users);
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'p-2';
    div.innerHTML = `${user.id} (${user.role}) <button onclick="removeUser('${user.uid}')" class="bg-red-500 text-white px-2 py-1 rounded">Remove</button>`;
    userList.appendChild(div);
  });
}

function removeUser(uid) {
  console.log('Removing user:', uid);
  if (confirm('Are you sure you want to remove this user?')) {
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(user => user.uid !== uid);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
  }
}

function loadLoginHistory() {
  console.log('Loading login history');
  const loginHistoryList = document.getElementById('login-history-list');
  loginHistoryList.innerHTML = '';
  const loginHistory = JSON.parse(localStorage.getItem('loginHistory'));
  console.log('Login history:', loginHistory);
  loginHistory.forEach(log => {
    const div = document.createElement('div');
    div.className = 'p-2';
    div.textContent = `${log.userId} logged in at ${new Date(log.timestamp).toLocaleString()}`;
    loginHistoryList.appendChild(div);
  });
}
