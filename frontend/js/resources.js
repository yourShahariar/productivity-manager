document.addEventListener('DOMContentLoaded', function() {
    // Load resources when resources section is shown
    document.querySelector('[data-section="resources"]').addEventListener('click', loadResources);

    // Add resource button
    document.getElementById('save-resource-btn').addEventListener('click', addResource);
});

function loadResources() {
    fetch('https://yourshahariar.pythonanywhere.com/resources', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(resources => {
        const resourcesGrid = document.getElementById('resources-grid');
        resourcesGrid.innerHTML = '';

        if (resources.length === 0) {
            resourcesGrid.innerHTML = '<div class="col-12"><div class="alert alert-info">No resources added yet.</div></div>';
            return;
        }

        resources.forEach(resource => {
            const resourceCol = document.createElement('div');
            resourceCol.className = 'col-md-6 col-lg-4';

            const resourceCard = document.createElement('div');
            resourceCard.className = 'card resource-card h-100';

            // Icon based on type
            let icon = 'bi-link';
            if (resource.type === 'video') icon = 'bi-play-circle';
            if (resource.type === 'article') icon = 'bi-newspaper';
            if (resource.type === 'report') icon = 'bi-file-earmark-text';
            if (resource.type === 'tool') icon = 'bi-tools';

            resourceCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${resource.title}</h5>
                        <span class="badge bg-secondary">${resource.type}</span>
                    </div>
                    <p class="card-text">${resource.notes || ''}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="${resource.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi ${icon}"></i> Open
                        </a>
                        <button class="btn btn-sm btn-outline-danger delete-resource" data-id="${resource.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            resourceCol.appendChild(resourceCard);
            resourcesGrid.appendChild(resourceCol);

            // Add event listener to delete button
            resourceCard.querySelector('.delete-resource').addEventListener('click', function() {
                deleteResource(this.getAttribute('data-id'));
            });
        });
    });
}

function addResource() {
    const title = document.getElementById('resource-title').value;
    const type = document.getElementById('resource-type').value;
    const url = document.getElementById('resource-url').value;
    const notes = document.getElementById('resource-notes').value;

    fetch('https://yourshahariar.pythonanywhere.com/resources', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
            title,
            type,
            url,
            notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Resource added successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('add-resource-modal')).hide();
            document.getElementById('add-resource-form').reset();

            // Reload resources
            loadResources();
        } else {
            alert('Failed to add resource');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add resource');
    });
}

function deleteResource(resourceId) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    fetch(`https://yourshahariar.pythonanywhere.com/resources/${resourceId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Resource deleted successfully') {
            // Reload resources
            loadResources();
        } else {
            alert('Failed to delete resource');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete resource');
    });
}
