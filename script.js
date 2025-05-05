class User {
    constructor(email, password, role, uid) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.uid = uid;
    }
}

// Initialize local storage
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([
    { email: 'admin', password: 'admin123', role: 'Admin', uid: 'admin1' }
  ]));
}
if (!localStorage.getItem('projects')) {
  localStorage.setItem('projects', JSON.stringify([]));
}
if (!localStorage.getItem('loginHistory')) {
  localStorage.setItem('loginHistory', JSON.stringify([]));
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory'));
    loginHistory.push({ userEmail: email, timestamp: new Date().toISOString() });
    localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('error-message').textContent = 'Invalid email or password';
    document.getElementById('error-message').classList.remove('hidden');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      window.location.href = 'index.html';
      return;
    }
    if (currentUser.role === 'Admin') {
      document.getElementById('admin-nav').classList.remove('hidden');
      document.getElementById('add-project-form').classList.remove('hidden');
    } else if (currentUser.role === 'Moderator') {
      document.getElementById('moderator-nav').classList.remove('hidden');
      document.getElementById('add-project-form').classList.remove('hidden');
    } else {
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
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

function loadProjects() {
  const projectList = document.getElementById('project-list');
  projectList.innerHTML = '';
  const projects = JSON.parse(localStorage.getItem('projects'));
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
  const projectName = document.getElementById('project-name').value;
  const fileName = document.getElementById('file-name').value;
  const fileLink = document.getElementById('file-link').value;
  if (projectName && fileName && fileLink) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects.push({
      name: projectName,
      files: [{ name: fileName, link: fileLink }],
      createdBy: JSON.parse(localStorage.getItem('currentUser')).email,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('projects', JSON.stringify(projects));
    document.getElementById('project-name').value = '';
    document.getElementById('file-name').value = '';
    document.getElementById('file-link').value = '';
    loadProjects();
  }
}

function addUser() {
  const email = document.getElementById('new-user-email').value;
  const password = document.getElementById('new-user-password').value;
  const role = document.getElementById('new-user-role').value;
  if (email && password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const uid = 'user' + Date.now();
    users.push({ email, password, role, uid });
    localStorage.setItem('users', JSON.stringify(users));
    alert('User added successfully');
    loadUsers();
  } else {
    alert('Please enter email and password');
  }
}

function loadUsers() {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  const users = JSON.parse(localStorage.getItem('users'));
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'p-2';
    div.innerHTML = `${user.email} (${user.role}) <button onclick="removeUser('${user.uid}')" class="bg-red-500 text-white px-2 py-1 rounded">Remove</button>`;
    userList.appendChild(div);
  });
}

function removeUser(uid) {
  if (confirm('Are you sure you want to remove this user?')) {
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(user => user.uid !== uid);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
  }
}

function loadLoginHistory() {
  const loginHistoryList = document.getElementById('login-history-list');
  loginHistoryList.innerHTML = '';
  const loginHistory = JSON.parse(localStorage.getItem('loginHistory'));
  loginHistory.forEach(log => {
    const div = document.createElement('div');
    div.className = 'p-2';
    div.textContent = `${log.userEmail} logged in at ${new Date(log.timestamp).toLocaleString()}`;
    loginHistoryList.appendChild(div);
  });
}
