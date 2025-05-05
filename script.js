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
  if (window.location.pathname.includes('dashboard.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Current user:', currentUser);
    if (!currentUser) {
      console.log('No current user, redirecting to index.html');
      window.location.href = 'index.html';
      return;
    }
    if (currentUser.role === 'Admin') {
      console.log('Showing admin navigation');
      document.getElementById('admin-nav').classList.remove('hidden');
      document.getElementById('add-project-form').classList.remove('hidden');
    } else if (currentUser.role === 'Moderator') {
      console.log('Showing moderator navigation');
      document.getElementById('moderator-nav').classList.remove('hidden');
      document.getElementById('add-project-form').classList.remove('hidden');
    } else {
      console.log('Showing general user navigation');
      document.getElementById('general-nav').classList.remove('hidden');
    }
    loadProjects();
    if (currentUser.role === 'Admin') {
      loadUsers();
      loadLoginHistory();
    }
    showSection('projects');
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
  console.log('Projects:', projects);
  projects.forEach(project => {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.innerHTML = `<h3 class="font-bold">${project.name}</h3>`;
    project.files.forEach(file => {
      div.innerHTML += `<p><a href="${file.link}" target="_blank" class="file-link text-blue-600">${file.name}</a></p>`;
    });
    projectList.appendChild(div);
  });
}

function addProject() {
  console.log('Adding project');
  const projectName = document.getElementById('project-name').value;
  const fileName = document.getElementById('file-name').value;
  const fileLink = document.getElementById('file-link').value;
  if (projectName && fileName && fileLink) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects.push({
      name: projectName,
      files: [{ name: fileName, link: fileLink }],
      createdBy: JSON.parse(localStorage.getItem('currentUser')).id,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('projects', JSON.stringify(projects));
    document.getElementById('project-name').value = '';
    document.getElementById('file-name').value = '';
    document.getElementById('file-link').value = '';
    loadProjects();
  } else {
    console.log('Project add failed: Missing fields');
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
