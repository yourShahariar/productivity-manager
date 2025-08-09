document.addEventListener('DOMContentLoaded', function() {
    // Load achievements when achievements section is shown
    document.querySelector('[data-section="achievements"]').addEventListener('click', loadAchievements);
    
    // Add achievement button
    document.getElementById('save-achievement-btn').addEventListener('click', addAchievement);
    
    // Set default date to today
    document.getElementById('achievement-date').value = new Date().toISOString().split('T')[0];
});

function loadAchievements() {
    fetch('http://localhost:5000/achievements', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(achievements => {
        const achievementsGrid = document.getElementById('achievements-grid');
        achievementsGrid.innerHTML = '';
        
        if (achievements.length === 0) {
            achievementsGrid.innerHTML = '<div class="col-12"><div class="alert alert-info">No achievements added yet.</div></div>';
            return;
        }
        
        // Sort achievements by date (newest first)
        achievements.sort((a, b) => new Date(b.achieved_on) - new Date(a.achieved_on));
        
        achievements.forEach(achievement => {
            const achievementCol = document.createElement('div');
            achievementCol.className = 'col-md-6 col-lg-4';
            
            const achievementCard = document.createElement('div');
            achievementCard.className = 'card achievement-card h-100';
            
            achievementCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${achievement.title}</h5>
                        <span class="badge bg-success"><i class="bi bi-trophy"></i></span>
                    </div>
                    <p class="card-text">${achievement.description}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Achieved on: ${new Date(achievement.achieved_on).toLocaleDateString()}</small>
                        <button class="btn btn-sm btn-outline-danger delete-achievement" data-id="${achievement.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            achievementCol.appendChild(achievementCard);
            achievementsGrid.appendChild(achievementCol);
            
            // Add event listener to delete button
            achievementCard.querySelector('.delete-achievement').addEventListener('click', function() {
                deleteAchievement(this.getAttribute('data-id'));
            });
        });
    });
}

function addAchievement() {
    const title = document.getElementById('achievement-title').value;
    const description = document.getElementById('achievement-description').value;
    const achievedOn = document.getElementById('achievement-date').value;
    
    fetch('http://localhost:5000/achievements', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
            title,
            description,
            achieved_on: achievedOn
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Achievement added successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('add-achievement-modal')).hide();
            document.getElementById('add-achievement-form').reset();
            
            // Reload achievements
            loadAchievements();
        } else {
            alert('Failed to add achievement');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add achievement');
    });
}

function deleteAchievement(achievementId) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    fetch(`http://localhost:5000/achievements/${achievementId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Achievement deleted successfully') {
            // Reload achievements
            loadAchievements();
        } else {
            alert('Failed to delete achievement');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete achievement');
    });
}