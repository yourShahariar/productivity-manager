document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        showApp();
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user_id', data.user_id);
                    showApp();
                } else {
                    alert(data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed');
            });
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'User registered successfully') {
                    alert('Registration successful! Please login.');
                    document.getElementById('login-tab').click();
                } else {
                    alert(data.message || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Registration failed');
            });
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            showAuth();
        });
    }
    
    // Navigation links
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
});

function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app-sections').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-sections').style.display = 'block';
    loadDashboard();
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Update title
    const titleMap = {
        'dashboard': 'Dashboard',
        'tasks': 'Tasks',
        'sessions': 'Sessions',
        'resources': 'Resources',
        'notes': 'Notes',
        'achievements': 'Achievements',
        'logs': 'Daily Logs'
    };
    
    document.getElementById('section-title').textContent = titleMap[section] || 'Dashboard';
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Load data for the section
    if (section === 'dashboard') {
        loadDashboard();
    } else if (section === 'tasks') {
        loadTasks();
    } else if (section === 'sessions') {
        loadSessions();
    } else if (section === 'resources') {
        loadResources();
    } else if (section === 'notes') {
        loadNotes();
    } else if (section === 'achievements') {
        loadAchievements();
    } else if (section === 'logs') {
        loadLogs();
    }
}

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'x-access-token': token
    };
}

function loadDashboard() {
    // Load recent tasks
    fetch('http://localhost:5000/tasks', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(tasks => {
        const recentTasksContainer = document.getElementById('recent-tasks');
        recentTasksContainer.innerHTML = '';
        
        const recentTasks = tasks.slice(0, 5);
        recentTasks.forEach(task => {
            const taskEl = document.createElement('a');
            taskEl.href = '#';
            taskEl.className = 'list-group-item list-group-item-action';
            taskEl.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${task.title}</h6>
                    <small class="text-muted">${new Date(task.deadline).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">${task.description || ''}</p>
                <small class="text-muted">${task.category_name || 'No category'}</small>
            `;
            recentTasksContainer.appendChild(taskEl);
        });
    });
    
    // Load today's sessions
    const today = new Date().toISOString().split('T')[0];
    fetch('http://localhost:5000/sessions', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(sessions => {
        const todaySessionsContainer = document.getElementById('today-sessions');
        todaySessionsContainer.innerHTML = '';
        
        const todaysSessions = sessions.filter(session => session.session_date === today);
        
        if (todaysSessions.length === 0) {
            todaySessionsContainer.innerHTML = '<p>No sessions recorded today.</p>';
            return;
        }
        
        todaysSessions.forEach(session => {
            const sessionEl = document.createElement('div');
            sessionEl.className = 'mb-3';
            sessionEl.innerHTML = `
                <div class="d-flex justify-content-between">
                    <strong>${session.task_title || 'General Session'}</strong>
                    <span>${session.duration_minutes} mins</span>
                </div>
                <div>${session.start_time} - ${session.end_time}</div>
                <small class="text-muted">${session.notes || ''}</small>
            `;
            todaySessionsContainer.appendChild(sessionEl);
        });
    });
    
    // Load recent notes
    fetch('http://localhost:5000/notes', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(notes => {
        const recentNotesContainer = document.getElementById('recent-notes');
        recentNotesContainer.innerHTML = '';
        
        const recentNotes = notes.slice(0, 3);
        recentNotes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'card note-card mb-3';
            noteEl.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${note.title}</h5>
                    <p class="card-text">${note.content.substring(0, 100)}...</p>
                    <small class="text-muted">Last updated: ${new Date(note.updated_at).toLocaleString()}</small>
                </div>
            `;
            recentNotesContainer.appendChild(noteEl);
        });
    });
    
    // Load mood chart
    fetch('http://localhost:5000/logs', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(logs => {
        const moodCounts = {
            productive: 0,
            tired: 0,
            stuck: 0,
            flow: 0
        };
        
        logs.forEach(log => {
            if (moodCounts.hasOwnProperty(log.mood)) {
                moodCounts[log.mood]++;
            }
        });
        
        const ctx = document.getElementById('mood-chart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Productive', 'Tired', 'Stuck', 'Flow'],
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: [
                        '#4e73df',
                        '#e74a3b',
                        '#f6c23e',
                        '#1cc88a'
                    ],
                    hoverBackgroundColor: [
                        '#2e59d9',
                        '#be2617',
                        '#dda20a',
                        '#17a673'
                    ],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    });
}