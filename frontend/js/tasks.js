document.addEventListener('DOMContentLoaded', function() {
    // Load tasks when tasks section is shown
    document.querySelector('[data-section="tasks"]').addEventListener('click', loadTasks);
    
    // Add task button
    document.getElementById('save-task-btn').addEventListener('click', addTask);
    
    // Update task button
    document.getElementById('update-task-btn').addEventListener('click', updateTask);
    
    // Load categories for task forms
    loadCategories();
});

function loadTasks() {
    fetch('http://localhost:5000/tasks', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(tasks => {
        // Clear existing tasks
        document.getElementById('all-tasks-list').innerHTML = '';
        document.getElementById('pending-tasks-list').innerHTML = '';
        document.getElementById('in-progress-tasks-list').innerHTML = '';
        document.getElementById('completed-tasks-list').innerHTML = '';
        
        if (tasks.length === 0) {
            const noTasks = document.createElement('div');
            noTasks.className = 'alert alert-info';
            noTasks.textContent = 'No tasks found. Add your first task!';
            document.getElementById('all-tasks-list').appendChild(noTasks);
            return;
        }
        
        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            
            // Add to all tasks list
            document.getElementById('all-tasks-list').appendChild(taskCard.cloneNode(true));
            
            // Add to status-specific list
            if (task.status === 'pending') {
                document.getElementById('pending-tasks-list').appendChild(taskCard.cloneNode(true));
            } else if (task.status === 'in_progress') {
                document.getElementById('in-progress-tasks-list').appendChild(taskCard.cloneNode(true));
            } else if (task.status === 'completed') {
                document.getElementById('completed-tasks-list').appendChild(taskCard.cloneNode(true));
            }
        });
    });
}

function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'card task-card mb-3';
    
    // Status badge color
    let badgeClass = 'bg-secondary';
    if (task.status === 'in_progress') badgeClass = 'bg-warning';
    if (task.status === 'completed') badgeClass = 'bg-success';
    
    // Format deadline
    const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline';
    
    taskCard.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between">
                <h5 class="card-title">${task.title}</h5>
                <span class="badge ${badgeClass}">${task.status.replace('_', ' ')}</span>
            </div>
            <p class="card-text">${task.description || ''}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${task.category_name || 'No category'} • Due: ${deadline}</small>
                <div>
                    <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.id}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">Delete</button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    taskCard.querySelector('.edit-task').addEventListener('click', function() {
        editTask(this.getAttribute('data-id'));
    });
    
    taskCard.querySelector('.delete-task').addEventListener('click', function() {
        deleteTask(this.getAttribute('data-id'));
    });
    
    return taskCard;
}

function loadCategories() {
    fetch('http://localhost:5000/categories', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(categories => {
        const taskCategorySelect = document.getElementById('task-category');
        const editTaskCategorySelect = document.getElementById('edit-task-category');
        
        // Clear existing options
        taskCategorySelect.innerHTML = '<option value="">Select Category</option>';
        editTaskCategorySelect.innerHTML = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            
            taskCategorySelect.appendChild(option.cloneNode(true));
            editTaskCategorySelect.appendChild(option);
        });
    });
}

function addTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const categoryId = document.getElementById('task-category').value;
    const deadline = document.getElementById('task-deadline').value;
    const status = document.getElementById('task-status').value;
    
    fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
            title,
            description,
            category_id: categoryId || null,
            deadline: deadline || null,
            status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Task added successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('add-task-modal')).hide();
            document.getElementById('add-task-form').reset();
            
            // Reload tasks
            loadTasks();
        } else {
            alert('Failed to add task');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add task');
    });
}

function editTask(taskId) {
    fetch(`http://localhost:5000/tasks/${taskId}`, {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(task => {
        // Find the task in the array (response might be an array)
        const taskData = Array.isArray(task) ? task.find(t => t.id == taskId) : task;
        
        // Populate edit form
        document.getElementById('edit-task-id').value = taskId;
        document.getElementById('edit-task-title').value = taskData.title;
        document.getElementById('edit-task-description').value = taskData.description || '';
        document.getElementById('edit-task-category').value = taskData.category_id || '';
        document.getElementById('edit-task-deadline').value = taskData.deadline || '';
        document.getElementById('edit-task-status').value = taskData.status;
        
        // Show edit modal
        new bootstrap.Modal(document.getElementById('edit-task-modal')).show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load task data');
    });
}

function updateTask() {
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value;
    const description = document.getElementById('edit-task-description').value;
    const categoryId = document.getElementById('edit-task-category').value;
    const deadline = document.getElementById('edit-task-deadline').value;
    const status = document.getElementById('edit-task-status').value;
    
    fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
            title,
            description,
            category_id: categoryId || null,
            deadline: deadline || null,
            status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Task updated successfully') {
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('edit-task-modal')).hide();
            document.getElementById('edit-task-form').reset();
            
            // Reload tasks
            loadTasks();
        } else {
            alert('Failed to update task');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update task');
    });
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Task deleted successfully') {
            // Reload tasks
            loadTasks();
        } else {
            alert('Failed to delete task');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete task');
    });
}