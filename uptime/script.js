// Define these variables at the top level of your script so they are accessible everywhere
const requiredHeader = document.querySelector('#required-tasks > h2');
const enjoymentHeader = document.querySelector('#enjoyment-tasks > h2');
const taskListRequired = document.getElementById('required-task-list');
const taskListEnjoyment = document.getElementById('enjoyment-task-list');

document.addEventListener('DOMContentLoaded', () => {
    // Define UI elements
    const homeButton = document.getElementById('home-button');
    const goalsButton = document.getElementById('goals-button');
    // const accountButton = document.getElementById('account-button'); // Commented out as per request
    const addTaskButton = document.getElementById('add-task-btn');
    const addGoalButton = document.getElementById('add-goal-btn');
    const taskListRequired = document.getElementById('required-task-list');
    const taskListEnjoyment = document.getElementById('enjoyment-task-list');
    const goalList = document.getElementById('goal-list');
    // const accountPage = document.getElementById('account-page'); // Commented out as per request
    const taskModal = document.getElementById('taskModal');
    const closeModalButton = document.getElementById('close-modal');
    // const profilePictureInput = document.getElementById('profile-picture'); // Commented out as per request
    // const profileDisplay = document.getElementById('profile-display'); // Commented out as per request
    let wallet = 0; // Wallet for points
    let supabaseClient;
    const requiredTasksList = document.getElementById('required-task-list');
    const enjoymentTasksList = document.getElementById('enjoyment-task-list');
    const requiredHeader = document.querySelector('#required-tasks > h2');
    const enjoymentHeader = document.querySelector('#enjoyment-tasks > h2');
    dailyReset();

    function updateTotalTimeDisplay(taskItem) {
        let totalTime = parseInt(taskItem.dataset.totalTime);
        let totalMinutes = Math.floor(totalTime / 60000);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;
        taskItem.querySelector('.total-time').textContent = `${hours}h ${minutes}m`; // Update total time display
    }
  
      function updateHeaders() {
        requiredHeader.classList.toggle('hidden', taskListRequired.children.length === 0);
        enjoymentHeader.classList.toggle('hidden', taskListEnjoyment.children.length === 0);
    }
  
  // Set an interval to update the wallet every minute
setInterval(() => {
    updateWallet();
}, 60000);  // 60000 milliseconds = 1 minute

// Function to stop all timers before resetting
function stopAllTimers() {
    document.querySelectorAll('.task.active').forEach(taskItem => {
        stopTimer(taskItem); // Stop the timer for each active task
    });
}

function resetTaskState(task) {
    task.classList.remove('active');
    task.dataset.elapsedTime = '0';  // Reset elapsed time
    // Any other state reset needed
}

function nameExists(name) {
    // Define the lists and classes to check
    const lists = ['required-task-list', 'enjoyment-task-list', 'goal-list'];
    const classes = ['task-name', 'goal-name'];

    // Check each list and class for a match
    for (let listId of lists) {
        for (let className of classes) {
            const elements = document.getElementById(listId).getElementsByClassName(className);
            for (let element of elements) {
                if (element.textContent.trim() === name) {
                    return true;  // Name found, return true
                }
            }
        }
    }
    return false;  // No match found, return false
}

// Ensure manual reset also stops all timers
document.getElementById('test-reset').addEventListener('click', function() {
    stopAllTimers(); // Stop all timers before resetting
    document.querySelectorAll('.task').forEach(task => {
        let dailyTime = parseInt(task.dataset.elapsedTime);
        let previousTotal = parseInt(task.dataset.totalTime) || 0;
        task.dataset.totalTime = (previousTotal + dailyTime).toString();
        task.dataset.elapsedTime = '0'; // Reset daily elapsed time
        updateTotalTimeDisplay(task);  // Update display after adding to total
        resetTaskDisplay(task); // Reset the task display
    });
    alert('Daily reset triggered manually for testing.');
});
    // Navigation buttons handling
    homeButton.onclick = () => showPage('home-page');
    goalsButton.onclick = () => showPage('goals-page');
    // accountButton.onclick = () => showPage('account-page'); // Commented out as per request
  
  document.getElementById('task-duration').addEventListener('change', function() {
    var selectedOption = this.options[this.selectedIndex];
    if (selectedOption.classList.contains('placeholder-option')) {
        selectedOption.style.color = '#AAAFB4'; // Grey out the placeholder when selected
    } else {
        this.style.color = 'AAAFB4'; // Default color for other options
    }
});

function autoClickTask(taskItem) {
    // Ensure no task is considered active
    if (activeTask) {
        stopTimer(activeTask);
        activeTask = null;
    }

    // Force start the timer
    startTimer(taskItem);

    // Ensure it stops after 1 second
    setTimeout(() => {
        if (taskItem.classList.contains('active')) {
            stopTimer(taskItem);
        }
    }, 1000);
}


    // Function to toggle active state
    function toggleActiveState(activeButton) {
        const buttons = [homeButton, goalsButton];
        buttons.forEach(button => button.classList.remove('active'));
        activeButton.classList.add('active');
    }
  
  // To save a duration
localStorage.setItem('taskDuration', '30'); // saves as string

// To retrieve the duration
const duration = localStorage.getItem('taskDuration');


    // Function to show different pages
    function showPage(pageId) {
        document.querySelectorAll('.page-section').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';
    }

    // Event listeners for navigation buttons
    homeButton.addEventListener('click', () => {
        showPage('home-page');
        toggleActiveState(homeButton);
    });

    goalsButton.addEventListener('click', () => {
        showPage('goals-page');
        toggleActiveState(goalsButton);
    });

/* You would have a similar event listener for accountButton if it were active */

    // Task addition
addTaskButton.onclick = () => {
    let taskName = document.getElementById('new-task-name').value.trim().toLowerCase();
   taskName = taskName.charAt(0).toUpperCase() + taskName.slice(1); // Add this line
    let taskDuration = document.getElementById('task-duration').value;
  let taskListValue = document.getElementById('task-list-select').value;
    let taskList = document.getElementById('task-list-select').value === 'enjoyment' ? taskListEnjoyment : taskListRequired;
    if (taskName && taskDuration && !nameExists(taskName)) {
        createTask(taskName, taskDuration, taskList);
        updateHeaders(); // Update headers after task addition
      document.getElementById('new-task-name').value = ''; // Clear the task name input field
      document.getElementById('task-duration').value = ''; // Optionally clear the duration field if needed
      document.getElementById('task-list-select').value = ''; // Reset the dropdown to the placeholder
    }
     else {
        alert("Task name already exists or invalid input.");
    }
  document.getElementById('new-task-name').value = ''; // Clear the task name input field
};

// Adding a goal (if similar logic is needed for goals)
addGoalButton.onclick = () => {
    let goalName = document.getElementById('new-goal-name').value.trim().toLowerCase();
   goalName = goalName.charAt(0).toUpperCase() + goalName.slice(1); // Add this line
    if (goalName && !nameExists(goalName)) {
        createGoal(goalName);
      document.getElementById('new-goal-name').value = ''; // Clear the goal name input field on success
    } else {
        alert("Goal name already exists or invalid input.");
    }
  document.getElementById('new-goal-name').value = ''; // Clear the goal name input field on success
};

  
// Prevent numbers, special characters, duplicate names, and limit text to 12 characters in the task name
document.getElementById('new-task-name').addEventListener('keypress', function(e) {
    var allowedRegex = /^[a-zA-Z\s]*$/;
    var char = String.fromCharCode(e.which);

    // Check if character is allowed, if name is duplicate, or if input exceeds 12 characters
    if (!allowedRegex.test(char) || nameExists(this.value + char, 'required-task-list') || this.value.length >= 12) {
        e.preventDefault();  // Prevent character from being input
    }
});

// Prevent numbers, special characters, duplicate names, and limit text to 12 characters in the goal name
document.getElementById('new-goal-name').addEventListener('keypress', function(e) {
    var allowedRegex = /^[a-zA-Z\s]*$/;
    var char = String.fromCharCode(e.which);

    // Check if character is allowed, if name is duplicate, or if input exceeds 12 characters
    if (!allowedRegex.test(char) || nameExists(this.value + char, 'goal-list') || this.value.length >= 12) {
        e.preventDefault();  // Prevent character from being input
    }
});

function createTask(name, duration, list, username) {
    let listItem = document.createElement('li');
    listItem.classList.add('task');
    listItem.innerHTML = `<span class="task-name">${name}</span>
                          <div class="progress-bar"></div>
                          <span class="task-timer">00:00:00 / ${duration} min</span>
                          <div class="task-stats">
                              <span class="total-time">0h 0m</span>
                              <span class="days-duration-hit">${0}</span>
                              <span class="days-since-created">${0}</span>
                          </div>
                          <button class="delete-task"><i class="fas fa-trash"></i></button>`;
    listItem.dataset.duration = duration;
    listItem.dataset.totalTime = 0;
    listItem.dataset.creationDate = new Date().toISOString();
    listItem.dataset.daysDurationHit = 0;
    listItem.dataset.daysSinceCreated = 0;
    listItem.dataset.elapsedTime = 0;
    listItem.dataset.list = list.id;

    list.appendChild(listItem);

    listItem.onclick = () => toggleTimer(listItem);
    let deleteButton = listItem.querySelector('.delete-task');
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(listItem);
            updateHeaders(); // Update headers when tasks are removed
        }
    };

    adjustFontSize(listItem.querySelector('.task-name'));
    deleteButton.classList.add('navigation-btn');
    if (list.id === "enjoyment-task-list") {
        autoClickTask(listItem);
    }

    // Call saveUserData at the end of createTask
    saveUserData(username);
}

// Function to create a goal with modal popup for task association
function createGoal(name) {
    let listItem = document.createElement('li');
    listItem.classList.add('goal');
    listItem.innerHTML = `<span class="goal-name">${name}</span>
                          <span class="associated-tasks"></span>
                          <button class="delete-goal">Delete</button>`; // Added delete button
    listItem.onclick = () => openTaskModal(listItem);
    listItem.querySelector('.delete-goal').onclick = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this goal?')) {
            deleteGoal(listItem);
        }
    };
  listItem.querySelector('.delete-goal').classList.add('navigation-btn');
    goalList.appendChild(listItem);
}

// Function to delete a goal
function deleteGoal(goalItem) {
    goalItem.remove();
}

// Function to reset the task timer and progress bar for each task
function resetTaskDisplay(taskItem) {
    const taskDuration = parseInt(taskItem.dataset.duration, 10); // Duration in minutes
    const taskDurationMillis = taskDuration * 60000; // Convert duration to milliseconds

    // Add elapsedTime to totalTime and reset elapsedTime
    let elapsedTime = parseInt(taskItem.dataset.elapsedTime);
    let totalTime = parseInt(taskItem.dataset.totalTime) || 0;
    taskItem.dataset.totalTime = (totalTime + elapsedTime).toString();
    taskItem.dataset.elapsedTime = '0';

    if (taskItem.parentNode.id === 'enjoyment-task-list') {
        // Start with one second subtracted from the full duration
        taskItem.dataset.elapsedTime = '1000'; // Simulate one second has passed
        taskItem.querySelector('.task-timer').textContent = formatTime(taskDurationMillis - 1000) + ` / ${taskDuration} min`;
        taskItem.querySelector('.progress-bar').style.width = `${(taskDurationMillis - 1000) / taskDurationMillis * 100}%`;
    } else {
        // For required tasks, reset to 0
        taskItem.querySelector('.task-timer').textContent = `00:00:00 / ${taskDuration} min`;
        taskItem.querySelector('.progress-bar').style.width = '0%';
        taskItem.dataset.elapsedTime = '0';
    }
}

function dailyReset() {
    const currentEstTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
    if (currentEstTime.getHours() === 0 && currentEstTime.getMinutes() === 0) {
        stopAllTimers(); // Stop all timers first
        document.querySelectorAll('.task').forEach(task => {
            resetTaskState(task); // Ensure task is ready for auto-click
            if (task.parentNode.id === 'enjoyment-task-list') {
                autoClickTask(task);
            }
            let dailyTime = parseInt(task.dataset.elapsedTime);
            let previousTotal = parseInt(task.dataset.totalTime) || 0;
            task.dataset.totalTime = (previousTotal + dailyTime).toString();
            task.dataset.elapsedTime = '0'; // Reset daily elapsed time
            task.dataset.hasIncrementedToday = 'false'; // Reset the increment flag for the new day
            updateTotalTimeDisplay(task);  // Update display after adding to total
            resetTaskDisplay(task); // Reset the task display
            
            // Force DOM to acknowledge changes
            task.offsetHeight;

            // Check and apply auto-click to tasks in the enjoyment list
            if (task.parentNode.id === 'enjoyment-task-list') {
                console.log(`Auto-clicking enjoyment task: ${task.querySelector('.task-name').textContent}`);
                autoClickTask(task);
            }
        });
    }
    setTimeout(dailyReset, 60000); // Re-check every minute
}
 // Function to calculate and update the wallet
function updateWallet() {
    let totalRequiredTime = Array.from(document.getElementById('required-task-list').querySelectorAll('.task'))
        .reduce((sum, task) => sum + parseInt(task.dataset.elapsedTime || 0, 10), 0);
    let totalEnjoymentTime = Array.from(document.getElementById('enjoyment-task-list').querySelectorAll('.task'))
        .reduce((sum, task) => sum + parseInt(task.dataset.elapsedTime || 0, 10), 0);

    // Calculate wallet value as the difference in seconds, then convert to minutes
    let walletValue = (totalRequiredTime - totalEnjoymentTime) / 60000;
    document.getElementById('wallet').textContent = Math.floor(walletValue).toString();
}
  
  // Function to format time from milliseconds to HH:MM:SS
  function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60;
    minutes %= 60;
    hours %= 24;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
  
    // Initialize visibility of headers based on tasks present
    updateHeaders();

// Pad numbers for display
function pad(number) {
    return number < 10 ? '0' + number : number;
}

// Function to show different pages
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}
  
      // Modal for associating tasks with goals
    function openTaskModal(goalItem) {
        taskModal.style.display = 'block';
        populateTaskSelectionList(goalItem);
    }

function associateTaskWithGoal(goalItem, task) {
    const associatedTasks = goalItem.querySelector('.associated-tasks');
    const taskName = task.querySelector('.task-name').textContent;

    // Check if task is already associated
    if (associatedTasks.innerHTML.includes(taskName + '; ')) {
        // If associated, remove from the list
        associatedTasks.innerHTML = associatedTasks.innerHTML.replace(taskName + '; ', '');
    } else {
        // If not associated, add to the list
        associatedTasks.innerHTML += `${taskName}; `;
    }
}

function adjustFontSize(taskNameElement) {
    const baseSize = 18; // Base font size for 6 characters
    const maxLength = 6; // Max length without reducing size
    const currentLength = taskNameElement.textContent.length;

    if (currentLength > maxLength) {
        const newSize = baseSize * Math.sqrt(maxLength / currentLength);
        taskNameElement.style.fontSize = `${newSize}px`;
    } else {
        taskNameElement.style.fontSize = `${baseSize}px`; // Default font size
    }
}
  
  
function populateTaskSelectionList(goalItem) {
    const taskSelectionList = document.getElementById('task-selection-list');
    taskSelectionList.innerHTML = '';
    const associatedTasks = goalItem.querySelector('.associated-tasks').textContent;

    document.querySelectorAll('.task').forEach(task => {
        const taskOption = document.createElement('li');
        taskOption.classList.add('task-option');
        taskOption.textContent = task.querySelector('.task-name').textContent;

        // Check if task is already associated and apply a different style/class
        if (associatedTasks.includes(taskOption.textContent + '; ')) {
            taskOption.classList.add('associated'); // Add a class for styling
            // Add box-shadow effect
            taskOption.style.boxShadow = '0 0 10px 2px #39FF14';
        }

        taskOption.onclick = () => {
            associateTaskWithGoal(goalItem, task);
            // Toggle class for visual feedback
            taskOption.classList.toggle('associated');
            // Toggle box-shadow effect
            if (taskOption.classList.contains('associated')) {
                taskOption.style.boxShadow = '0 0 10px 2px #39FF14';
            } else {
                taskOption.style.boxShadow = '';
            }
        };
        taskSelectionList.appendChild(taskOption);
    });
    // Add a "Confirm" button to the task selection list
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = closeModal; // Close the modal when the "Confirm" button is clicked
  confirmButton.className = 'navigation-btn'; // Assign the class to the button
    taskSelectionList.appendChild(confirmButton);
}
 

// Function to close the task association modal
function closeModal() {
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        taskModal.style.display = 'none';
    }
}
      // Initialize the application state
    toggleActiveState(homeButton); // Ensure home is set as active
      // Initialize the home page display
    showPage('home-page');
});

let activeTask = null;

function initializeSupabase() {
const supabaseUrl = '';
const supabaseAnonKey = '';
supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);


}
initializeSupabase();
    if (typeof supabaseClient === "undefined") {
        // Check if supabase is not defined yet
        alert('Supabase client is not defined yet.');
        window.onload = initializeSupabase;
    } else {
        // If supabase is already defined, initialize immediately
        initializeSupabase();
    }

    async function addUser(username, tasks, goals) {
        try {
            const existingUser = await getUserData(username);
            if (existingUser  === null) {
                alert('Username already exists, please try another username.');
                return;
            }
    
            const { data, error } = await supabaseClient
                .from('users')
                .insert([{ username, tasks: JSON.stringify(tasks), goals: JSON.stringify(goals) }]);
                console.log('User added successfully:', data);
    
            if (error) {
                console.error('Error adding user:', error);
                alert('Error adding user.');
                return;
            }
    
            console.log('User added successfully:', data);
            alert('user added successfully')
            displayUsername(username); // Display username on successful addition
        } catch (error) {
            console.error('Operation error:', error);
            alert('Try a different username!');
        }
    }
    async function getUserData(username) {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
    
        if (error && error.message !== 'No rows found') {
            console.error('Error retrieving user data:', error);
            return { error };
        }
    
        if (data) {
            populateTasks(JSON.parse(data.tasks));
            populateGoals(JSON.parse(data.goals));
            displayUsername(username); // Add this line
            alert('User data retrieved successfully.');
            return data; // Return data when user is found
        } else {
            console.log('Username not found.');
            alert('Username not found. Please try a different one.');
            return null; // Return null when no user is found
        }
    }
    function populateGoals(goals) {
        const goalList = document.getElementById('goal-list');
        goalList.innerHTML = ''; // Clear existing goals
    
        goals.forEach(goal => {
            const goalItem = document.createElement('li');
            goalItem.textContent = goal.name;
            goalList.appendChild(goalItem);
        });
    }
    
// Function to display the added or retrieved username
function displayUsername(username) {
    const usernameDisplay = document.getElementById('username-display');
    usernameDisplay.textContent = `Username: ${username}`;
}

// Event listener for the "Add User" button
document.getElementById('submit-user').addEventListener('click', async function() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        const tasks = collectTasksData();  // Should contain actual data collection logic
        const goals = collectGoalsData();  // Should contain actual data collection logic
        await addUser(username, tasks, goals);
    } else {
        alert('Please enter a username.');
    }
});

// Event listener for the "Retrieve User" button
document.getElementById('retrieve-user').addEventListener('click', async function() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        const userData = await getUserData(username);
        if (userData) {
            console.log('User data retrieved successfully:', userData);
            displayUsername(username); // Ensure this is called on successful retrieval
            populateTasks(JSON.parse(userData.tasks)); // Populate tasks after successful retrieval
        } else {
            alert('Username not found.');
        }
    } else {
        alert('Please enter a username.');
    }
});

function collectTasksData() {
    // Collect and return tasks data from your UI
    return Array.from(document.querySelectorAll('.task')).map(task => {
        return {
            name: task.querySelector('.task-name').textContent,
            duration: task.dataset.duration,
            totalTime: task.dataset.totalTime,
            daysDurationHit: task.dataset.daysDurationHit,
            daysSinceCreated: task.dataset.daysSinceCreated,
            elapsedTime: task.dataset.elapsedTime,
            list: task.dataset.list,
        };
    });
}

function collectGoalsData() {
    // Collect and return goals data from your UI
    return Array.from(document.querySelectorAll('.goal')).map(goal => {
        return {
            name: goal.querySelector('.goal-name').textContent,
            associatedTasks: goal.querySelector('.associated-tasks').textContent.split('; '),
        };
    });
}


// Function to start or resume the timer for a task
function startTimer(taskItem) {
    if (!taskItem.interval) {  // Only start a new interval if one isn't already running
        taskItem.classList.add('active');
        let startTime = Date.now();
        let elapsed = parseInt(taskItem.dataset.elapsedTime || 0);
        taskItem.dataset.startTime = startTime - elapsed;

        taskItem.interval = setInterval(() => {
            elapsed = Date.now() - parseInt(taskItem.dataset.startTime);
            taskItem.dataset.elapsedTime = elapsed.toString(); // Update elapsed time
            updateTaskTimerDisplay(taskItem);
        }, 1000);

        activeTask = taskItem; // Set the new task as the active task
    }
}

// Function to stop the timer for a task
function stopTimer(taskItem, reset = false) {
    if (taskItem.interval) {
        clearInterval(taskItem.interval);  // Clear the interval if it exists
        taskItem.interval = null;  // Reset the interval tracker to null
        taskItem.classList.remove('active');
        let elapsed = Date.now() - parseInt(taskItem.dataset.startTime);
        taskItem.dataset.elapsedTime = elapsed.toString(); // Final update to elapsed time
        // Update total time only on reset
        if (reset) {
            let totalTime = parseInt(taskItem.dataset.totalTime || 0);
            taskItem.dataset.totalTime = (totalTime + elapsed).toString();
        }
        updateTaskTimerDisplay(taskItem);  // Update the display
    }
    if (activeTask === taskItem) {
        activeTask = null; // Clear the active task if it's the current one
    }
}



function toggleTimer(taskItem) {
    // Check if there is an active task and it's different from the current one
    if (activeTask && activeTask !== taskItem) {
        stopTimer(activeTask);  // Stop the currently active task
    }

    // Now handle the current task item
    if (taskItem.classList.contains('active')) {
        stopTimer(taskItem);  // If it's active, stop the timer
    } else {
        startTimer(taskItem);  // If it's not active, start the timer
    }
}

function updateTaskTimerDisplay(taskItem) {
    let isEnjoymentTask = taskItem.parentNode.id === 'enjoyment-task-list';
    let taskDuration = parseInt(taskItem.dataset.duration, 10) * 60000;
    let elapsedTime = parseInt(taskItem.dataset.elapsedTime);

    let displayTime, progressPercentage;

    if (!isEnjoymentTask) { // Required tasks: always count up
        displayTime = formatTime(elapsedTime);
        progressPercentage = (elapsedTime / taskDuration) * 100;
    } else { // Enjoyment tasks: count down then count up when past duration
        if (elapsedTime <= taskDuration) {
            displayTime = formatTime(taskDuration - elapsedTime);
            progressPercentage = 100 - (elapsedTime / taskDuration) * 100;
        } else {
            displayTime = '-' + formatTime(elapsedTime - taskDuration);
            progressPercentage = 0;
        }
    }

// Increment days-duration-hit when task duration is exceeded
if (elapsedTime > taskDuration) {
    let daysDurationHit = parseInt(taskItem.dataset.daysDurationHit);
    let hasIncrementedToday = taskItem.dataset.hasIncrementedToday === 'true';

    if (!hasIncrementedToday) {
        taskItem.dataset.daysDurationHit = daysDurationHit + 1;
        taskItem.querySelector('.days-duration-hit').textContent = taskItem.dataset.daysDurationHit;
        taskItem.dataset.hasIncrementedToday = 'true'; // Mark that we've incremented today
    }
}

    taskItem.querySelector('.task-timer').textContent = `${displayTime} / ${taskItem.dataset.duration} min`;
    taskItem.querySelector('.progress-bar').style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;

   // Use total time to calculate the total time in minutes
   let totalTime = parseInt(taskItem.dataset.totalTime || 0);
   let totalMinutes = Math.floor(totalTime / 60000);
   let hours = Math.floor(totalMinutes / 60);
   let minutes = totalMinutes % 60;
   taskItem.querySelector('.total-time').textContent = `${hours}h ${minutes}m`;
}

function populateTasks(tasks) {
    console.log('Tasks:', tasks);
    const requiredTaskList = document.getElementById('required-task-list');
    const enjoymentTaskList = document.getElementById('enjoyment-task-list');
    requiredTaskList.innerHTML = '';
    enjoymentTaskList.innerHTML = '';

    activeTask = null;

    tasks.forEach(task => {
        let listItem = document.createElement('li');
        listItem.classList.add('task');
        listItem.dataset.duration = task.duration;
        listItem.dataset.totalTime = task.totalTime;
        listItem.dataset.creationDate = new Date().toISOString();
        listItem.dataset.daysDurationHit = task.daysDurationHit;
        listItem.dataset.daysSinceCreated = task.daysSinceCreated;
        listItem.dataset.elapsedTime = task.elapsedTime;

        // Update the total time display
        let totalTime = parseInt(task.totalTime || 0);
        let totalMinutes = Math.floor(totalTime / 60000);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;

        listItem.innerHTML = `<span class="task-name">${task.name}</span>
                              <div class="progress-bar"></div>
                              <span class="task-timer">00:00:00 / ${task.duration} min</span>
                              <div class="task-stats">
                                  <span class="total-time">${hours}h ${minutes}m</span>
                                  <span class="days-duration-hit">${task.daysDurationHit}</span>
                                  <span class="days-since-created">${task.daysSinceCreated}</span>
                              </div>
                              <button class="delete-task"><i class="fas fa-trash"></i></button>`;

        listItem.onclick = () => {
            toggleTimer(listItem);
            updateTaskTimerDisplay(listItem);
        };
        let deleteButton = listItem.querySelector('.delete-task');
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(listItem);
                updateHeaders();
            }
        };

        // Add these lines from createTask
        listItem.dataset.list = task.list;
        adjustFontSize(listItem.querySelector('.task-name'));
        deleteButton.classList.add('navigation-btn');
        if (task.list === 'enjoyment') {
            autoClickTask(listItem);
        }

        if (task.list === 'required-task-list') {
            requiredTaskList.appendChild(listItem);
        } else if (task.list === 'enjoyment-task-list') {
            enjoymentTaskList.appendChild(listItem);
        }
    });

    updateHeaders();
}

  // Function to format time from milliseconds to HH:MM:SS
  function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60;
    minutes %= 60;
    hours %= 24;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
// Pad numbers for display
function pad(number) {
    return number < 10 ? '0' + number : number;
}
startAutoSave(); // Start automatic data saving

function startAutoSave() {
    setInterval(() => {
        const username = document.getElementById('username').value.trim();
        if (!username) return; // Do not proceed if username is not set
        saveUserData(username);
    }, 300000); // 5 minutes interval
}

  // Set an interval to update the wallet every minute
  setInterval(() => {
    updateWallet();
}, 60000);  // 60000 milliseconds = 1 minute

 // Function to calculate and update the wallet
 function updateWallet() {
    let totalRequiredTime = Array.from(document.getElementById('required-task-list').querySelectorAll('.task'))
        .reduce((sum, task) => sum + parseInt(task.dataset.elapsedTime || 0, 10), 0);
    let totalEnjoymentTime = Array.from(document.getElementById('enjoyment-task-list').querySelectorAll('.task'))
        .reduce((sum, task) => sum + parseInt(task.dataset.elapsedTime || 0, 10), 0);

    // Calculate wallet value as the difference in seconds, then convert to minutes
    let walletValue = (totalRequiredTime - totalEnjoymentTime) / 60000;
    document.getElementById('wallet').textContent = Math.floor(walletValue).toString();
}

// Function to delete a task
function deleteTask(taskItem) {
    taskItem.remove();
}

async function saveUserData() {
    const tasks = collectTasksData();
    const goals = collectGoalsData();

    // Convert tasks and goals to JSON string
    const tasksJson = JSON.stringify(tasks);
    const goalsJson = JSON.stringify(goals);

    let data, error;
    // Upsert user data
    ({ data, error } = await supabaseClient
        .from('users')
        .upsert([{ username, tasks: tasksJson, goals: goalsJson }], { onConflict: 'username' }));

    if (error) {
        console.error('Error saving user data:', error);
        alert('Error saving user data.');
        return;
    }

    console.log('User data saved successfully:', data);
    alert('User data saved successfully.');
}


document.getElementById('save-data').addEventListener('click', async function() {
    const username = document.getElementById('username').value.trim();
    if (!username) return; // Do not proceed if username is not set

    try {
        await saveUserData(username);
    } catch (error) {
        console.error('Error saving user data:', error);
    }
});
let username = document.getElementById('username-display').textContent.replace('Username:', '').trim();

document.getElementById('username').addEventListener('input', function() {
    username = this.value.trim();
    document.getElementById('username-display').textContent = 'Username: ' + username;
});
function updateHeaders() {
    requiredHeader.classList.toggle('hidden', taskListRequired.children.length === 0);
    enjoymentHeader.classList.toggle('hidden', taskListEnjoyment.children.length === 0);
}
function adjustFontSize(taskNameElement) {
    const baseSize = 18; // Base font size for 6 characters
    const maxLength = 6; // Max length without reducing size
    const currentLength = taskNameElement.textContent.length;

    if (currentLength > maxLength) {
        const newSize = baseSize * Math.sqrt(maxLength / currentLength);
        taskNameElement.style.fontSize = `${newSize}px`;
    } else {
        taskNameElement.style.fontSize = `${baseSize}px`; // Default font size
    }
}