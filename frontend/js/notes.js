document.addEventListener('DOMContentLoaded', function() {
    // Load notes when notes section is shown
    document.querySelector('[data-section="notes"]').addEventListener('click', loadNotes);

    // Add note button
    document.getElementById('save-note-btn').addEventListener('click', addNote);
});

function loadNotes() {
    fetch('https://yourshahariar.pythonanywhere.com/notes', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(notes => {
        const notesGrid = document.getElementById('notes-grid');
        notesGrid.innerHTML = '';

        if (notes.length === 0) {
            notesGrid.innerHTML = '<div class="col-12"><div class="alert alert-info">No notes added yet.</div></div>';
            return;
        }

        notes.forEach(note => {
            const noteCol = document.createElement('div');
            noteCol.className = 'col-md-6 col-lg-4';

            const noteCard = document.createElement('div');
            noteCard.className = 'card note-card h-100';

            noteCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${note.title}</h5>
                    <p class="card-text">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Last updated: ${new Date(note.updated_at).toLocaleString()}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary view-note" data-id="${note.id}">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-note" data-id="${note.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            noteCol.appendChild(noteCard);
            notesGrid.appendChild(noteCol);

            // Add event listeners to buttons
            noteCard.querySelector('.view-note').addEventListener('click', function() {
                viewNote(this.getAttribute('data-id'));
            });

            noteCard.querySelector('.delete-note').addEventListener('click', function() {
                deleteNote(this.getAttribute('data-id'));
            });
        });
    });
}

function viewNote(noteId) {
    fetch(`https://yourshahariar.pythonanywhere.com/notes/${noteId}`, {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(note => {
        // Find the note in the array (response might be an array)
        const noteData = Array.isArray(note) ? note.find(n => n.id == noteId) : note;

        // Show note in a modal
        const modal = new bootstrap.Modal(document.createElement('div'));
        modal._element.className = 'modal fade';
        modal._element.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${noteData.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <pre style="white-space: pre-wrap; font-family: inherit;">${noteData.content}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal._element);
        modal.show();

        // Remove modal from DOM after it's hidden
        modal._element.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal._element);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load note');
    });
}

function addNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    fetch('https://yourshahariar.pythonanywhere.com/notes', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
            title,
            content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Note added successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('add-note-modal')).hide();
            document.getElementById('add-note-form').reset();

            // Reload notes
            loadNotes();
        } else {
            alert('Failed to add note');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add note');
    });
}

function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    fetch(`https://yourshahariar.pythonanywhere.com/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Note deleted successfully') {
            // Reload notes
            loadNotes();
        } else {
            alert('Failed to delete note');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete note');
    });
}
