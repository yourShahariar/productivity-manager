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


function startCountdown(badgeEl, endTimeIso) {
    let timer;

    function updateCountdown() {
        const now = new Date();
        const endTime = new Date(endTimeIso);

        // DEBUG: Check what times we're working with
        console.log('Now:', now, 'End time:', endTime, 'ISO:', endTimeIso);

        if (isNaN(endTime.getTime())) {
            badgeEl.textContent = "Invalid time";
            badgeEl.classList.remove("bg-primary");
            badgeEl.classList.add("bg-warning");
            clearInterval(timer);
            return;
        }

        // Calculate difference correctly (both in UTC)
        let diffMs = endTime.getTime() - now.getTime();

        if (diffMs <= 0) {
            badgeEl.textContent = "Expired";
            badgeEl.classList.remove("bg-primary");
            badgeEl.classList.add("bg-danger");
            clearInterval(timer);
            return;
        }

        const diffMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        if (hours > 0) {
            badgeEl.textContent = `${hours}h ${minutes}m left`;
        } else {
            badgeEl.textContent = `${minutes}m left`;
        }
    }

    updateCountdown();
    timer = setInterval(updateCountdown, 60000);
}



function loadSessions() {
    fetch('https://yourshahariar.pythonanywhere.com/sessions', {
        headers: getAuthHeader()
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Server error: ${text}`);
            });
        }
        return response.json();
    })
    .then(sessions => {
        console.log("Sessions data from backend:", sessions);
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

                // Format time display (just hours:minutes)
                const startDisplay = session.start_time ? session.start_time.substring(0, 5) : 'null';
                const endDisplay = session.end_time ? session.end_time.substring(0, 5) : 'null';

                sessionEl.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <h5>${session.task_title || 'General Session'}</h5>
                        <span class="badge bg-primary countdown">Loading...</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>${startDisplay} - ${endDisplay}</span>
                    </div>
                    <p>${session.notes || ''}</p>
                    <button class="btn btn-sm btn-outline-danger delete-session" data-id="${session.id}">Delete</button>
                `;

                sessionEl.querySelector('.delete-session').addEventListener('click', function() {
                    deleteSession(this.getAttribute('data-id'));
                });

                sessionsList.appendChild(sessionEl);

                // Start countdown if we have end time
                const badge = sessionEl.querySelector('.countdown');
                if (session.end_time_iso) {
                    startCountdown(badge, session.end_time_iso);
                } else {
                    badge.textContent = "No end time";
                    badge.classList.remove("bg-primary");
                    badge.classList.add("bg-warning");
                }
            });
        });
    })
    .catch(error => {
        console.error('Failed to load sessions:', error);
        const sessionsList = document.getElementById('sessions-list');
        sessionsList.innerHTML = '<div class="alert alert-danger">Failed to load sessions. Please try again later.</div>';
    });
}


function loadTasksForSession() {
    fetch('https://yourshahariar.pythonanywhere.com/tasks', {
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

    fetch('https://yourshahariar.pythonanywhere.com/sessions', {
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

    fetch(`https://yourshahariar.pythonanywhere.com/sessions/${sessionId}`, {
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

