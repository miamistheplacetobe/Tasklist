// --- Updated Functions ---

function createTaskElement(taskText, isCompleted = false) {
    const newTask = document.createElement('li');
    const taskInput = document.createElement('input');
    const settingButton = document.createElement('input');
    settingButton.type = 'image';
    settingButton.height = 20;
    settingButton.src = 'setting.png'; // Ensure you have a settings.png in your project
    taskInput.type = 'text';
    taskInput.value = taskText;
    taskInput.className = 'task-input';
    const taskCheckbox = document.createElement('input');
    taskCheckbox.type = 'checkbox';
    taskCheckbox.className = 'task-checkbox'; // Use a class, not an ID

    if (isCompleted) {
        newTask.classList.add('completed');
        taskCheckbox.checked = true;
    }
    newTask.appendChild(settingButton);
    newTask.appendChild(taskInput);
    newTask.appendChild(taskCheckbox);
    taskList.appendChild(newTask);

    setupTaskListeners(taskInput, newTask, taskCheckbox, settingButton);
}

function setupTaskListeners(inputElement, listItem, taskCheckbox, settingButton) {
    // Save when the checkbox is clicked
    taskCheckbox.addEventListener('click', function(event) {
        listItem.classList.toggle('completed');
        saveTasks();
    });

    // Save when the input loses focus (after editing or deleting)
    inputElement.addEventListener('blur', function() {
        const value = inputElement.value.trim();
        if (value === '') {
            listItem.remove();
        }
        saveTasks();
    });
    settingButton.addEventListener('click', function() {
        let menu = document.createElement('div');
        menu.className = 'settings-menu';
        menu.style.position = 'absolute';
        menu.style.background = '#fff';
        menu.style.border = '1px solid #ccc';
        menu.style.padding = '8px';
        menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        menu.style.zIndex = 1000;


        //add set time and date option
        const dateLabel = document.createElement('label');
        dateLabel.textContent = 'Set Date: ';
        dateLabel.style.display = 'block';
        dateLabel.style.marginBottom = '4px';

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.style.marginRight = '8px';

        const timeLabel = document.createElement('label');
        timeLabel.textContent = 'Set Time: ';
        timeLabel.style.display = 'block';
        timeLabel.style.marginBottom = '4px';

        const timeInput = document.createElement('input');
        timeInput.type = 'time';

        // Load previously set date/time if present
        if (listItem.dataset.date) dateInput.value = listItem.dataset.date;
        if (listItem.dataset.time) timeInput.value = listItem.dataset.time;

        dateInput.addEventListener('change', function() {
            listItem.dataset.date = dateInput.value;
            saveTasks();
        });
        timeInput.addEventListener('change', function() {
            listItem.dataset.time = timeInput.value;
            saveTasks();
        });

        dateLabel.appendChild(dateInput);
        timeLabel.appendChild(timeInput);
        menu.appendChild(dateLabel);
        menu.appendChild(timeLabel);
        function updateDateTimeDisplay() {
            // Remove existing display if present
            let existing = listItem.querySelector('.date-time-display');
            if (existing) existing.remove();

            // Only show if either date or time is set
            if (dateInput.value || timeInput.value) {
            const display = document.createElement('span');
            display.className = 'date-time-display';
            display.style.float = 'right';
            display.style.marginLeft = '10px';
            display.style.fontSize = '0.9em';
            display.style.color = '#888';

            let text = '';
            if (dateInput.value) {
                const dateVal = new Date(dateInput.value + (timeInput.value ? 'T' + timeInput.value : 'T00:00'));
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                const dateOnly = new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());

                if (dateOnly.getTime() === today.getTime()) {
                text += 'Today';
                } else if (dateOnly.getTime() === tomorrow.getTime()) {
                text += 'Tomorrow';
                } else {
                // Format as "Aug 27"
                const options = { month: 'short', day: 'numeric' };
                text += dateVal.toLocaleDateString(undefined, options);
                }
            }
            if (timeInput.value) {
                // Format time as "12:23pm"
                let [hour, minute] = timeInput.value.split(':');
                hour = parseInt(hour, 10);
                const ampm = hour >= 12 ? 'pm' : 'am';
                hour = hour % 12 || 12;
                const formattedTime = `${hour}:${minute}${ampm}`;
                text += (text ? ' ' : '') + formattedTime;
            }
            display.textContent = text;

            listItem.appendChild(display);
            }
        }

        // Initial display if already set
        updateDateTimeDisplay();

        dateInput.addEventListener('change', updateDateTimeDisplay);
        timeInput.addEventListener('change', updateDateTimeDisplay);
        // Add a delete option
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Task';
        deleteBtn.style.display = 'block';
        deleteBtn.style.width = '100%';
        deleteBtn.style.marginBottom = '4px';
        deleteBtn.addEventListener('click', function() {
            listItem.remove();
            saveTasks();
            document.body.removeChild(menu);
        });

        // Add a cancel/close option
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.display = 'block';
        closeBtn.style.width = '100%';
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(menu);
        });

        // Append buttons to menu
        menu.appendChild(deleteBtn);
        menu.appendChild(closeBtn);

        // Position the menu near the settings button
        const rect = settingButton.getBoundingClientRect();
        menu.style.left = `${rect.right + window.scrollX + 5}px`;
        menu.style.top = `${rect.top + window.scrollY}px`;

        // Remove any existing menu
        document.querySelectorAll('.settings-menu').forEach(m => m.remove());

        // Add menu to body
        document.body.appendChild(menu);

        // Close menu if clicking outside
        function handleClickOutside(e) {
            if (!menu.contains(e.target) && e.target !== settingButton) {
                menu.remove();
                document.removeEventListener('mousedown', handleClickOutside);
            }
        }
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);
    });
}

// --- Main Logic ---

function saveTasks() {
    const tasks = [];
    const taskItems = document.querySelectorAll('#taskList li');
    taskItems.forEach(item => {
        const input = item.querySelector('.task-input');
        const checkbox = item.querySelector('input[type="checkbox"]');
        tasks.push({
            text: input.value,
            completed: checkbox.checked
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        const tasks = JSON.parse(saved);
        tasks.forEach(task => {
            createTaskElement(task.text, task.completed); // Pass the 'completed' status
        });
    }
}

// Call loadTasks when the page first loads
loadTasks();



const activeBtn = document.getElementById('activebtn');
const completedBtn = document.getElementById('completedbtn');
const allBtn = document.getElementById('allbtn');

activeBtn.addEventListener('click', function() {
    filterTasks('active');
});
completedBtn.addEventListener('click', function() {
    filterTasks('completed');
});
allBtn.addEventListener('click', function() {
    filterTasks('all');
});

function filterTasks(filter) {
    allBtn.style.backgroundColor = '#007aff';
    activeBtn.style.backgroundColor = '#007aff';
    completedBtn.style.backgroundColor = '#007aff';
    const taskItems = document.querySelectorAll('#taskList li');
    taskItems.forEach(item => {
        const isCompleted = item.classList.contains('completed');
        if (filter === 'all') {
            item.style.display = '';
            allBtn.style.backgroundColor = 'gray';
        } else if (filter === 'active') {
            item.style.display = isCompleted ? 'none' : '';
            activeBtn.style.backgroundColor = 'gray';
        } else if (filter === 'completed') {
            item.style.display = isCompleted ? '' : 'none';
            completedBtn.style.backgroundColor = 'gray';
        }
    });
}

// Handle adding a new task
addTaskBtn.addEventListener('click', function() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        createTaskElement(taskText);
        taskInput.value = '';
        saveTasks();
    }
});