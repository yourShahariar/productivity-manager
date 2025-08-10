document.addEventListener('DOMContentLoaded', function() {
    // Load logs when logs section is shown
    document.querySelector('[data-section="logs"]').addEventListener('click', loadLogs);

    // Add log button
    document.getElementById('save-log-btn').addEventListener('click', addLog);

    // Set default date to today
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
});

function loadLogs() {
    fetch('https://yourshahariar.pythonanywhere.com/logs', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(logs => {
        const logsList = document.getElementById('logs-list');
        logsList.innerHTML = '';

        if (logs.length === 0) {
            logsList.innerHTML = '<div class="alert alert-info">No logs recorded yet.</div>';
            return;
        }

        // Sort logs by date (newest first)
        logs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

        logs.forEach(log => {
            const logEl = document.createElement('div');
            logEl.className = 'log-item';

            // Mood badge color
            let badgeClass = 'bg-secondary';
            if (log.mood === 'productive') badgeClass = 'bg-success';
            if (log.mood === 'tired') badgeClass = 'bg-warning';
            if (log.mood === 'stuck') badgeClass = 'bg-danger';
            if (log.mood === 'flow') badgeClass = 'bg-primary';

            logEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5>${new Date(log.log_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</h5>
                    <span class="badge ${badgeClass}">${log.mood}</span>
                </div>
                <p>${log.summary}</p>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-sm btn-outline-danger delete-log" data-id="${log.id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            `;

            logsList.appendChild(logEl);

            // Add event listener to delete button
            logEl.querySelector('.delete-log').addEventListener('click', function() {
                deleteLog(this.getAttribute('data-id'));
            });
        });
    });
}

function addLog() {
    const logDate = document.getElementById('log-date').value;
    const summary = document.getElementById('log-summary').value;
    const mood = document.getElementById('log-mood').value;

    fetch('https://yourshahariar.pythonanywhere.com/logs', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
            log_date: logDate,
            summary,
            mood
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Log added successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('add-log-modal')).hide();
            document.getElementById('add-log-form').reset();

            // Reload logs
            loadLogs();
        } else {
            alert('Failed to add log');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add log');
    });
}

function deleteLog(logId) {
    if (!confirm('Are you sure you want to delete this log?')) return;

    fetch(`https://yourshahariar.pythonanywhere.com/logs/${logId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Log deleted successfully') {
            // Reload logs
            loadLogs();
        } else {
            alert('Failed to delete log');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete log');
    });
}
