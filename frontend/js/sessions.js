document.addEventListener('DOMContentLoaded', function() {
    // Load sessions when sessions section is shown
    document.querySelector('[data-section="sessions"]').addEventListener('click', loadSessions);
    
    // Add session button
    document.getElementById('save-session-btn').addEventListener('click', addSession);
    
    // Set default date to today
    document.getElementById('session-date').value = new Date().toISOString().split('T')[0];
    
    // Load tasks for session form
    loadTasksForSession();
});

function loadSessions() {
    fetch('http://localhost:5000/sessions', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(sessions => {
        const sessionsList = document.getElementById('sessions-list');
        sessionsList.innerHTML = '';
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<div class="alert alert-info">No sessions recorded yet.</div>';
            return;
        }
        
        // Group sessions by date
        const sessionsByDate = {};
        sessions.forEach(session => {
            const date = session.session_date;
            if (!sessionsByDate[date]) {
                sessionsByDate[date] = [];
            }
            sessionsByDate[date].push(session);
        });
        
        // Sort dates in descending order
        const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));
        
        // Create session elements
        sortedDates.forEach(date => {
            const dateHeader = document.createElement('h4');
            dateHeader.className = 'mt-4 mb-3';
            dateHeader.textContent = new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            sessionsList.appendChild(dateHeader);
            
            sessionsByDate[date].forEach(session => {
                const sessionEl = document.createElement('div');
                sessionEl.className = 'session-item';
                sessionEl.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <h5>${session.task_title || 'General Session'}</h5>
                        <span class="badge bg-primary">${session.duration_minutes} mins</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>${session.start_time} - ${session.end_time}</span>
                    </div>
                    <p>${session.notes || ''}</p>
                    <button class="btn btn-sm btn-outline-danger delete-session" data-id="${session.id}">Delete</button>
                `;
                
                sessionEl.querySelector('.delete-session').addEventListener('click', function() {
                    deleteSession(this.getAttribute('data-id'));
                });
                
                sessionsList.appendChild(sessionEl);
            });
        });
    });
}

function loadTasksForSession() {
    fetch('http://localhost:5000/tasks', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(tasks => {
        const taskSelect = document.getElementById('session-task');
        taskSelect.innerHTML = '<option value="">Select Task</option>';
        
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.title;
            taskSelect.appendChild(option);
        });
    });
}

function addSession() {
    const taskId = document.getElementById('session-task').value;
    const date = document.getElementById('session-date').value;
    const startTime = document.getElementById('session-start-time').value;
    const endTime = document.getElementById('session-end-time').value;
    const notes = document.getElementById('session-notes').value;
    
    // Calculate duration in minutes
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = (end - start) / (1000 * 60);
    
    fetch('http://localhost:5000/sessions', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
            task_id: taskId || null,
            session_date: date,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: duration,
            notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Session added successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('add-session-modal')).hide();
            document.getElementById('add-session-form').reset();
            
            // Reload sessions
            loadSessions();
        } else {
            alert('Failed to add session');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add session');
    });
}

function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    fetch(`http://localhost:5000/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Session deleted successfully') {
            // Reload sessions
            loadSessions();
        } else {
            alert('Failed to delete session');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete session');
    });
}