// ===== 1. Grab the HTML elements we need =====
// document.getElementById finds an element by its id="..." attribute.
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const count = document.getElementById("task-count");
const historyList = document.getElementById("history-list");
const categorySelect = document.getElementById("task-category");
const dateInput = document.getElementById("task-date");
const upcomingList = document.getElementById("upcoming-list");
const filters = document.getElementById("filters");
// The All / Active / Done buttons. querySelectorAll finds every element
// that matches, here every button inside #status-filter.
const statusButtons = document.querySelectorAll("#status-filter button");

// ===== 2. Categories =====
// The categories every user starts with, each with an icon that describes it.
const builtInCategories = [
  { id: "projects", name: "Projects", icon: "💼" },
  { id: "chores", name: "House chores", icon: "🧹" },
  { id: "outdoor", name: "Outdoor activities", icon: "🌳" },
];

// Categories the user made themselves, e.g. [{ id: "custom-1697...", name: "Gym", icon: "🏋️" }]
let customCategories = JSON.parse(localStorage.getItem("categories")) || [];

// All categories together: the built-in ones first, then the user's own.
// It's rebuilt whenever a category is added or deleted.
let categories = builtInCategories.concat(customCategories);

// Icons to choose from when making a new category.
// `words` are the start of words that suggest that icon, e.g. a category called
// "Gym" or "Morning run" gets 🏋️ automatically (you can still pick another one).
const iconChoices = [
  { icon: "⭐", name: "General", words: [] },
  { icon: "🏋️", name: "Fitness", words: ["gym", "workout", "fitness", "exercise", "run", "yoga", "sport", "train"] },
  { icon: "📚", name: "Reading and study", words: ["read", "book", "study", "school", "class", "learn", "exam", "homework", "course"] },
  { icon: "💻", name: "Work", words: ["work", "job", "office", "meeting", "client", "career"] },
  { icon: "🛒", name: "Shopping", words: ["shop", "grocer", "buy", "market", "errand"] },
  { icon: "💰", name: "Money", words: ["money", "bill", "bank", "budget", "financ", "pay", "saving"] },
  { icon: "❤️", name: "Health", words: ["health", "doctor", "medic", "dentist", "wellness", "therapy", "self"] },
  { icon: "🍳", name: "Cooking", words: ["cook", "meal", "food", "recipe", "bake", "dinner", "lunch"] },
  { icon: "✈️", name: "Travel", words: ["travel", "trip", "holiday", "vacation", "flight", "pack"] },
  { icon: "👨‍👩‍👧", name: "Family", words: ["family", "kid", "child", "parent", "mum", "mom", "dad"] },
  { icon: "🎨", name: "Hobbies", words: ["hobby", "hobbies", "art", "craft", "paint", "draw", "music", "game", "garden"] },
  { icon: "🐾", name: "Pets", words: ["pet", "dog", "cat", "vet", "puppy"] },
  { icon: "🎉", name: "Events", words: ["party", "event", "birthday", "wedding", "celebrat"] },
];

// Suggests an icon from a category name, e.g. guessIcon("Morning run") gives "🏋️".
// It splits the name into words and looks for one that starts with a word in the list.
function guessIcon(name) {
  const nameWords = name.toLowerCase().split(/[^a-z]+/);
  const match = iconChoices.find(function (choice) {
    return choice.words.some(function (start) {
      return nameWords.some(function (word) {
        return word.startsWith(start);
      });
    });
  });
  return match ? match.icon : "⭐"; // nothing matched: a general star
}

// A category's icon. Categories made before icons existed get a plain label 🏷️.
function iconFor(category) {
  return category.icon || "🏷️";
}

// Makes a small <span> with a category's icon. aria-hidden: screen readers
// skip it, because the category's name is right next to it anyway.
function makeIcon(category) {
  const span = document.createElement("span");
  span.className = "cat-icon";
  span.setAttribute("aria-hidden", "true");
  span.textContent = iconFor(category);
  return span;
}

// Is this one of the user's own categories? (Only those can be deleted.)
function isCustom(id) {
  return customCategories.some(function (category) {
    return category.id === id;
  });
}

// Finds a category by its id, e.g. getCategory("chores") gives { id: "chores", name: "House chores" }.
// Returns undefined for tasks made before categories existed.
function getCategory(id) {
  return categories.find(function (category) {
    return category.id === id;
  });
}

// ===== 3. Load saved data =====
// localStorage only stores text, so we saved our data as JSON strings.
// JSON.parse turns that text back into a real JavaScript array.
// If nothing is saved yet, we start with an empty array [].
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Each task is an object that looks like this:
// { id: 1697371234567.42, text: "Buy milk", done: false, category: "chores", date: "2026-10-18" }
// `date` is the day the task is planned for. Tasks made before scheduling existed
// don't have one, and we treat them as "today".

// The history is a separate list of everything you've finished.
// It's kept apart from `tasks` so it stays even after you delete a task.
let history = JSON.parse(localStorage.getItem("history")) || [];

// Each history entry looks like this:
// { taskId: 1697371234567.42, text: "Buy milk", category: "chores", date: "2026-10-15", time: 1697371299999 }

// Which filter button is selected: "all" or a category id like "chores".
// We save it too, so the app opens on the same view next time.
let currentFilter = localStorage.getItem("filter") || "all";

// Which status button is selected: "all", "active" (not done yet) or "done".
let currentStatus = localStorage.getItem("status") || "all";

// The user's details from the welcome screen, e.g. { name: "Judith", gender: "female" }.
// null means we don't know them yet, so the welcome screen is shown.
let profile = JSON.parse(localStorage.getItem("profile"));

// End-of-day reminder settings.
// on: is it switched on?  time: when to remind, like "20:00" (8 PM)
// dismissedOn / notifiedOn: the day you last dismissed the reminder / got a pop-up,
// so each only happens once a day.
let reminder = JSON.parse(localStorage.getItem("reminder")) || {
  on: true,
  time: "20:00",
  dismissedOn: "",
  notifiedOn: "",
};

// ===== 4. Save data =====
// JSON.stringify turns our arrays into text so localStorage can keep them.
// They stay there even after you close the browser.
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

function saveFilter() {
  localStorage.setItem("filter", currentFilter); // already plain text, no JSON needed
}

function saveStatus() {
  localStorage.setItem("status", currentStatus);
}

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(customCategories));
}

function saveReminder() {
  localStorage.setItem("reminder", JSON.stringify(reminder));
}

function saveProfile() {
  localStorage.setItem("profile", JSON.stringify(profile));
}

// ===== 5. Date helpers =====
// Turns a date into a simple label like "2026-10-15".
// We use this as the "day" each finished task belongs to.
function getDayKey(date) {
  const year = date.getFullYear();
  // getMonth() counts from 0 (January = 0), so we add 1.
  // padStart adds a leading zero, so 5 becomes "05".
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Today's day key, e.g. "2026-10-16"
function todayKey() {
  return getDayKey(new Date());
}

// Turns a day key like "2026-10-15" into a friendly heading.
function getDayLabel(dayKey) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1); // go back one day
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1); // go forward one day

  if (dayKey === getDayKey(today)) {
    return "Today";
  }
  if (dayKey === getDayKey(yesterday)) {
    return "Yesterday";
  }
  if (dayKey === getDayKey(tomorrow)) {
    return "Tomorrow";
  }
  // Otherwise show something like "Monday, October 12"
  return new Date(dayKey + "T00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// A short date like "Wed 14 Oct", used on the "Overdue" label
function getShortDate(dayKey) {
  return new Date(dayKey + "T00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ===== 6. Which list does a task belong in? =====
// Day keys like "2026-10-16" can be compared as plain text:
// "2026-10-15" < "2026-10-16" is true, just like the real dates.

// The day a task is planned for (old tasks without a date count as today)
function taskDay(task) {
  return task.date || todayKey();
}

// Upcoming: planned for a day after today
function isUpcoming(task) {
  return taskDay(task) > todayKey();
}

// Overdue: planned for an earlier day and still not done
function isOverdue(task) {
  return taskDay(task) < todayKey() && !task.done;
}

// Today's list: tasks for today, plus overdue ones.
// (Finished tasks from earlier days drop off; they're still in History.)
function isForToday(task) {
  return taskDay(task) === todayKey() || isOverdue(task);
}

// Does the task match the selected category button?
function matchesFilter(task) {
  return currentFilter === "all" || task.category === currentFilter;
}

// Does the task match the selected All / Active / Done button?
function matchesStatus(task) {
  if (currentStatus === "active") {
    return !task.done;
  }
  if (currentStatus === "done") {
    return task.done;
  }
  return true; // "all" shows everything
}

// ===== 7. Show the filter buttons =====
// One button for "All" plus one per category, each showing how many of
// today's tasks are left.
function renderFilters() {
  filters.innerHTML = "";

  // Build the list of buttons we need: "All" first, then every category
  const options = [{ id: "all", name: "All" }].concat(categories);

  options.forEach(function (option) {
    // Count today's unfinished tasks that this button covers
    const left = tasks.filter(function (task) {
      const inThisFilter = option.id === "all" || task.category === option.id;
      return inThisFilter && isForToday(task) && !task.done;
    }).length;

    const button = document.createElement("button");
    button.type = "button"; // a plain button, so it doesn't submit the form
    button.className = "filter-btn";
    if (option.id !== "all") {
      button.appendChild(makeIcon(option)); // the category's icon, before its name
    }

    const label = document.createElement("span");
    label.textContent = option.name;

    const badge = document.createElement("span");
    badge.className = "filter-count";
    badge.textContent = left;

    button.appendChild(label);
    button.appendChild(badge);

    // aria-pressed tells screen readers which button is currently selected
    button.setAttribute("aria-pressed", option.id === currentFilter);

    button.addEventListener("click", function () {
      currentFilter = option.id;
      saveFilter();
      // Handy shortcut: new tasks go into the category you're looking at
      if (option.id !== "all") {
        categorySelect.value = option.id;
        lastPickedCategory = option.id;
      }
      renderTasks();
    });

    filters.appendChild(button);
  });

  // The "+ New category" button at the end of the row
  const newButton = document.createElement("button");
  newButton.type = "button";
  newButton.className = "filter-btn new-category-btn";
  newButton.textContent = "+ New category";
  newButton.addEventListener("click", openCategoryForm);
  filters.appendChild(newButton);

  // Show "Delete category" only when one of the user's own categories is selected
  deleteCategoryBtn.hidden = !isCustom(currentFilter);
  editCategoryBtn.hidden = !isCustom(currentFilter);
  resetDeleteCategoryBtn();
}

// ===== 8. All / Active / Done buttons =====
// Marks the selected button (the CSS highlights it)
function updateStatusButtons() {
  statusButtons.forEach(function (button) {
    // Each button says which status it is in its data-status="..." attribute,
    // which JavaScript reads as button.dataset.status
    button.setAttribute("aria-pressed", button.dataset.status === currentStatus);
  });
}

// When a status button is clicked, switch to it and redraw
statusButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentStatus = button.dataset.status;
    saveStatus();
    renderTasks();
  });
});

// ===== 9. Build one task row =====
// Makes the <li> for a single task: checkbox, text, labels and delete button.
// Used for both today's list and the Upcoming list.
function createTaskItem(task) {
  const li = document.createElement("li");
  if (task.done) {
    li.classList.add("done"); // the CSS crosses out "done" tasks
  }

  // A checkbox to mark the task as done / not done
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", function () {
    const justFinished = checkbox.checked;

    toggleTask(task.id);

    // Only celebrate when this click finished the LAST of today's tasks.
    // (Tasks planned for later days don't count.)
    const todaysTasks = tasks.filter(isForToday);
    const allDone = todaysTasks.length > 0 && todaysTasks.every(function (t) {
      return t.done;
    });
    if (justFinished && allDone && isForToday(task)) {
      // Burst from the middle of the screen.
      // innerWidth / innerHeight are the width and height of the browser window.
      celebrate(window.innerWidth / 2, window.innerHeight / 2);
    }
  });

  // The task text. We use textContent (not innerHTML) so any
  // HTML someone types is shown as plain text, which is safer.
  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;

  // The text and its labels sit together in one column
  const body = document.createElement("div");
  body.className = "task-body";
  body.appendChild(span);

  // A row for the small labels under the text
  const tags = document.createElement("div");
  tags.className = "tags";

  // A red "Overdue" label if the task's day has passed
  if (isOverdue(task)) {
    const overdue = document.createElement("span");
    overdue.className = "tag overdue";
    overdue.textContent = "Overdue · " + getShortDate(taskDay(task));
    tags.appendChild(overdue);
  }

  // Show a small colored category label, but only in the "All" view
  // (when you're looking at one category, every task has the same label).
  const category = getCategory(task.category);
  if (category && currentFilter === "all") {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.appendChild(makeIcon(category));
    tag.append(category.name); // append adds the name as plain text after the icon
    tags.appendChild(tag);
  }

  // Only add the labels row if there's something in it
  if (tags.children.length > 0) {
    body.appendChild(tags);
  }

  // A button to delete the task
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×"; // a small "x" symbol
  deleteBtn.className = "delete-btn";
  // Screen readers can't "see" the ×, so we give the button a spoken name
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.addEventListener("click", function () {
    deleteTask(task.id);
  });

  // Put the pieces inside the <li>
  li.appendChild(checkbox);
  li.appendChild(body);
  li.appendChild(deleteBtn);
  return li;
}

// ===== 10. Show the tasks on the page =====
// This function rebuilds today's list and the Upcoming list from the `tasks` array.
// We call it every time something changes.
function renderTasks() {
  renderFilters();
  updateStatusButtons();

  // --- Today's list ---
  list.innerHTML = "";

  // Today's tasks in the selected category (used for the counter below)
  const todaysTasks = tasks.filter(function (task) {
    return isForToday(task) && matchesFilter(task);
  });

  // The ones we actually show: those that also match All / Active / Done.
  // Overdue tasks go first, so they're easy to spot.
  const shownTasks = todaysTasks.filter(matchesStatus);
  shownTasks.sort(function (a, b) {
    return isOverdue(b) - isOverdue(a); // true counts as 1, false as 0
  });

  shownTasks.forEach(function (task) {
    list.appendChild(createTaskItem(task));
  });

  // Update the "tasks left" counter for today's list
  const remaining = todaysTasks.filter(function (task) {
    return !task.done;
  }).length;
  const selected = getCategory(currentFilter); // undefined when "All" is selected

  if (todaysTasks.length === 0 && selected) {
    count.textContent = "Nothing in " + selected.name + " for today.";
  } else if (todaysTasks.length === 0) {
    count.textContent = "Nothing planned for today. Add a task above!";
  } else if (shownTasks.length === 0 && currentStatus === "done") {
    count.textContent = selected
      ? "Nothing finished in " + selected.name + " yet today."
      : "Nothing finished yet today.";
  } else if (shownTasks.length === 0 && currentStatus === "active") {
    count.textContent = selected
      ? "Nothing left to do in " + selected.name + " today!"
      : "Nothing left to do today!";
  } else if (selected) {
    count.textContent = remaining + " of " + todaysTasks.length + " left in " + selected.name + " today";
  } else {
    count.textContent = remaining + " of " + todaysTasks.length + " tasks left today";
  }

  renderUpcoming();

  // Redraw the history too, since checking a task changes it
  renderHistory();

  // Finishing (or adding) tasks can show or hide the reminder
  checkReminder();
}

// ===== 11. Show the Upcoming list =====
// Tasks planned for later days, grouped by day, soonest first.
function renderUpcoming() {
  upcomingList.innerHTML = "";

  const upcoming = tasks.filter(function (task) {
    return isUpcoming(task) && matchesFilter(task) && matchesStatus(task);
  });

  if (upcoming.length === 0 && currentStatus !== "all") {
    upcomingList.textContent = "No upcoming tasks to show here.";
    return;
  }
  if (upcoming.length === 0) {
    upcomingList.textContent = "Nothing planned yet. Pick a later date when you add a task.";
    return;
  }

  // Group the tasks by day, like the History does.
  // `days` ends up looking like: { "2026-10-17": [task], "2026-10-20": [task, task] }
  const days = {};
  upcoming.forEach(function (task) {
    const day = taskDay(task);
    if (!days[day]) {
      days[day] = [];
    }
    days[day].push(task);
  });

  // Soonest day first ("2026-10-17" sorts before "2026-10-20")
  Object.keys(days).sort().forEach(function (day) {
    const heading = document.createElement("h3");
    heading.textContent = getDayLabel(day);
    upcomingList.appendChild(heading);

    const ul = document.createElement("ul");
    ul.className = "task-list";
    days[day].forEach(function (task) {
      ul.appendChild(createTaskItem(task));
    });
    upcomingList.appendChild(ul);
  });
}

// ===== 12. Show the history on the page =====
// Groups finished tasks by day, newest day first.
function renderHistory() {
  // Remember which days are open right now, so redrawing doesn't close them.
  // (Each day's box has data-day="2026-10-15", which JavaScript reads as .dataset.day)
  const openDays = [];
  historyList.querySelectorAll("details[open]").forEach(function (details) {
    openDays.push(details.dataset.day);
  });
  // Is this the first time we draw the history? Then only the newest day starts open.
  const firstTime = historyList.querySelector("details") === null;

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.textContent = "Tasks you finish will show up here, grouped by day.";
    return;
  }

  // Step 1: sort entries into groups, one group per day.
  // `days` ends up looking like: { "2026-10-15": [entry, entry], "2026-10-14": [entry] }
  const days = {};
  history.forEach(function (entry) {
    if (!days[entry.date]) {
      days[entry.date] = []; // first entry for this day: start an empty group
    }
    days[entry.date].push(entry);
  });

  // Step 2: get the list of days, newest first.
  // "2026-10-15" style keys sort correctly as plain text.
  const dayKeys = Object.keys(days).sort().reverse();

  // Step 3: build one collapsible section per day.
  // <details> is a built-in HTML element you can click to open/close.
  dayKeys.forEach(function (dayKey, index) {
    const entries = days[dayKey];

    const details = document.createElement("details");
    details.dataset.day = dayKey;
    if (firstTime) {
      details.open = index === 0; // only the newest day starts open
    } else {
      details.open = openDays.includes(dayKey); // keep it how it was
    }

    // The clickable heading, e.g. "Today · 3 done"
    const summary = document.createElement("summary");
    summary.textContent = getDayLabel(dayKey) + " · " + entries.length + " done";
    details.appendChild(summary);

    // The list of tasks finished that day
    const ul = document.createElement("ul");
    entries.forEach(function (entry) {
      const li = document.createElement("li");

      const text = document.createElement("span");
      text.className = "history-text";
      text.textContent = "✓ " + entry.text;

      // The category's icon shows which category it was from
      const category = getCategory(entry.category);
      if (category) {
        const icon = makeIcon(category);
        icon.title = category.name; // shows the name when you hover over the icon
        text.prepend(icon); // put the icon at the start
      }

      // Show the time it was finished, e.g. "3:42 PM"
      const time = document.createElement("small");
      time.textContent = new Date(entry.time).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });

      // A small × to delete just this entry from the history
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "history-delete";
      deleteBtn.textContent = "×";
      deleteBtn.setAttribute("aria-label", "Delete from history");
      deleteBtn.title = "Delete from history";
      deleteBtn.addEventListener("click", function () {
        deleteHistoryEntry(entry);
      });

      li.appendChild(text);
      li.appendChild(time);
      li.appendChild(deleteBtn);
      ul.appendChild(li);
    });
    details.appendChild(ul);

    // A button to delete the whole day. It needs two clicks, so a whole day
    // can't be wiped out by accident.
    const dayBtn = document.createElement("button");
    dayBtn.type = "button";
    dayBtn.className = "history-delete-day";
    dayBtn.textContent = "Delete this day";
    let confirmTimer;
    dayBtn.addEventListener("click", function () {
      if (dayBtn.dataset.confirm === "yes") {
        // Second click: really delete it
        clearTimeout(confirmTimer);
        deleteHistoryDay(dayKey);
      } else {
        // First click: ask to click again
        dayBtn.dataset.confirm = "yes";
        dayBtn.textContent = "Click again to delete " + entries.length + (entries.length === 1 ? " entry" : " entries");
        // If they don't click again within 4 seconds, go back to normal
        confirmTimer = setTimeout(function () {
          dayBtn.dataset.confirm = "";
          dayBtn.textContent = "Delete this day";
        }, 4000);
      }
    });
    details.appendChild(dayBtn);

    historyList.appendChild(details);
  });
}

// ===== 13. Delete history =====
// These only remove the record from History. Your tasks stay as they are.

// Delete one entry. `entry` is the exact object from the history array,
// so filter keeps every entry except that one.
function deleteHistoryEntry(entry) {
  history = history.filter(function (item) {
    return item !== entry;
  });
  saveHistory();
  renderHistory();
}

// Delete every entry from one day, e.g. "2026-10-15"
function deleteHistoryDay(dayKey) {
  history = history.filter(function (item) {
    return item.date !== dayKey;
  });
  saveHistory();
  renderHistory();
}

// ===== 14. Celebrate when ALL tasks are done 🎉 =====
const toast = document.getElementById("toast");
let toastTimer; // remembers the timer so we can restart it

// x and y are the screen position to burst from (the middle of the screen)
function celebrate(x, y) {
  // Part 1: three big party emojis that burst out and fade away
  const emojis = ["🎉", "🎊", "🥳"];

  emojis.forEach(function (emoji, index) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = emoji;
    piece.style.left = x + "px";
    piece.style.top = y + "px";

    // Fan the emojis out upwards: up-left, straight up, and up-right.
    // The angles are -150°, -90° and -30° (in screen terms, negative means up).
    // Math.cos / Math.sin turn each angle into a left/right and up/down distance.
    const angle = ((-150 + index * 60) * Math.PI) / 180; // degrees to radians
    const distance = 90 + Math.random() * 40; // 90–130 pixels away
    piece.style.setProperty("--dx", Math.cos(angle) * distance + "px");
    piece.style.setProperty("--dy", Math.sin(angle) * distance + "px");

    document.body.appendChild(piece);

    // Remove the emoji once its animation is over, so they don't pile up
    piece.addEventListener("animationend", function () {
      piece.remove();
    });
  });

  // Part 2: a message at the bottom of the screen
  if (profile) {
    showMessage("All done for today, " + profile.name + "! 🎉");
  } else {
    showMessage("All done for today! 🎉");
  }
}

// Shows a short message in the bubble at the bottom of the screen
function showMessage(text) {
  toast.textContent = text;
  toast.classList.add("show");

  // Hide it again after 3 seconds. clearTimeout cancels any older timer
  // first, so the message doesn't vanish early if this runs twice quickly.
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

// ===== 15. Add a new task =====
function addTask(text, category, date) {
  const newTask = {
    // The current time plus a random number gives each task its own unique id
    // (time alone could repeat if two tasks are added in the same millisecond)
    id: Date.now() + Math.random(),
    text: text,
    done: false,
    category: category,
    date: date,
  };
  tasks.push(newTask); // add it to the end of the array
  saveTasks();
  renderTasks();
}

// ===== 16. Mark a task as done / not done =====
function toggleTask(id) {
  tasks.forEach(function (task) {
    if (task.id === id) {
      task.done = !task.done; // flip true <-> false

      if (task.done) {
        // Finished an overdue task? Move it to today, so it stays in today's
        // list (crossed out) instead of vanishing the moment you tick it.
        if (taskDay(task) < todayKey()) {
          task.date = todayKey();
        }

        // Just finished: record it in the history under today's date
        const now = new Date();
        history.push({
          taskId: task.id,
          text: task.text,
          category: task.category,
          date: getDayKey(now),
          time: now.getTime(),
        });
      } else {
        // Un-checked (maybe by mistake): take it back out of the history
        history = history.filter(function (entry) {
          return entry.taskId !== task.id;
        });
      }
    }
  });
  saveTasks();
  saveHistory();
  renderTasks();
}

// ===== 17. Delete a task =====
// Note: this only removes it from the to-do list. If it was finished,
// it stays in the history, so you keep a record of what you did.
function deleteTask(id) {
  // filter keeps every task EXCEPT the one with this id
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  renderTasks();
}

// ===== 18. Listen for the form being submitted =====
// This runs when you click "Add" (or press Ctrl+Enter / ⌘+Enter, see below).
form.addEventListener("submit", function (event) {
  // Stop the browser from reloading the page (the default form behavior)
  event.preventDefault();

  const text = input.value.trim(); // trim removes spaces at the start/end
  if (text === "") {
    return; // don't add empty tasks
  }

  // Use the date picked in the date box (or today if it was left empty)
  const date = dateInput.value || todayKey();
  addTask(text, categorySelect.value, date); // use the category picked in the dropdown

  // A task for a later day goes into Upcoming, so say where it went
  if (date > todayKey()) {
    showMessage("Scheduled for " + getDayLabel(date));
  }

  dateInput.value = todayKey(); // back to today for the next task
  input.value = ""; // clear the box for the next task
  localStorage.removeItem("draft"); // the task is added, so there's no draft any more
  resizeTaskInput(); // shrink it back to one line
  input.focus();    // keep the cursor in the box
});

// ===== 19. The task text box =====
// Grow the box to fit what's typed, so long or multi-line tasks are easy to read.
// We reset the height, then set it to the height of the content (scrollHeight).
function resizeTaskInput() {
  input.style.height = "auto"; // back to its normal one-line height
  if (input.value === "") {
    return; // empty: keep the one-line height (don't size it to the placeholder text)
  }
  input.style.height = input.scrollHeight + "px";
}

input.addEventListener("input", resizeTaskInput);

// Re-measure when the window changes size (the text wraps differently),
// and once the Poppins font has loaded (it's a little wider than the fallback font).
window.addEventListener("resize", resizeTaskInput);
if (document.fonts) {
  document.fonts.ready.then(resizeTaskInput);
}

// Keep what you've typed (but not added yet) if the page is refreshed.
// It's saved on every key press, and put back when the page loads.
input.value = localStorage.getItem("draft") || "";
input.addEventListener("input", function () {
  localStorage.setItem("draft", input.value);
});

resizeTaskInput(); // size it once at the start, so it's the same height as after adding a task

// Enter adds a new line (that's what a <textarea> does on its own).
// Ctrl+Enter (or ⌘+Enter on a Mac) is a shortcut for clicking "Add".
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault(); // don't add a new line
    form.requestSubmit();   // same as clicking "Add"
  }
});

// ===== 20. Add your own categories =====
const categoryForm = document.getElementById("category-form");
const categoryName = document.getElementById("category-name");
const categoryError = document.getElementById("category-error");
const deleteCategoryBtn = document.getElementById("delete-category");

const iconPicker = document.getElementById("icon-picker");

// Has the user clicked an icon themselves? Then typing stops changing it.
let iconPickedByHand = false;

// Build the row of icons to choose from: one radio button per icon, shown as a tile
iconChoices.forEach(function (choice) {
  const label = document.createElement("label");
  label.className = "icon-choice";
  label.title = choice.name; // the icon's name shows when you hover over it

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "category-icon"; // same name for all: only one can be picked
  radio.value = choice.icon;
  radio.setAttribute("aria-label", choice.name);
  radio.addEventListener("change", function () {
    iconPickedByHand = true;
  });

  const emoji = document.createElement("span");
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = choice.icon;

  label.appendChild(radio);
  label.appendChild(emoji);
  iconPicker.appendChild(label);
});

// Ticks the radio button for an icon
function pickIcon(icon) {
  iconPicker.querySelectorAll("input").forEach(function (radio) {
    radio.checked = radio.value === icon;
  });
}

// The icon that's picked right now
function pickedIcon() {
  const picked = iconPicker.querySelector("input:checked");
  return picked ? picked.value : "⭐";
}

// Which category is being edited (its id), or null when making a new one
let editingCategoryId = null;
const categoryAddBtn = document.getElementById("category-add");

// Show the little "new category" box and put the cursor in it
function openCategoryForm() {
  editingCategoryId = null;
  categoryAddBtn.textContent = "Add";
  categoryForm.hidden = false;
  categoryName.value = "";
  categoryError.textContent = "";
  iconPickedByHand = false;
  pickIcon("⭐");
  categoryName.focus();
}

// Open the same box to edit one of your own categories (its name and icon)
function openEditCategory(category) {
  editingCategoryId = category.id;
  categoryAddBtn.textContent = "Save";
  categoryForm.hidden = false;
  categoryName.value = category.name;
  categoryError.textContent = "";
  if (category.icon) {
    iconPickedByHand = true; // keep its icon while you rename it
    pickIcon(category.icon);
  } else {
    // Made before icons existed: suggest one from its name (e.g. "Gym" gets 🏋️)
    iconPickedByHand = false;
    pickIcon(guessIcon(category.name));
  }
  categoryName.focus();
}

function closeCategoryForm() {
  categoryForm.hidden = true;
}

categoryForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = categoryName.value.trim();

  if (name === "") {
    categoryError.textContent = "Please type a name for the category.";
    categoryName.focus();
    return;
  }

  // No two categories with the same name (ignoring capital letters).
  // When editing, the category's own current name doesn't count.
  const taken = categories.some(function (category) {
    return category.id !== editingCategoryId && category.name.toLowerCase() === name.toLowerCase();
  });
  if (taken) {
    categoryError.textContent = "You already have a category called " + name + ".";
    categoryName.focus();
    return;
  }

  // Editing: update the category's name and icon, and we're done
  if (editingCategoryId) {
    const category = getCategory(editingCategoryId);
    category.name = name;
    category.icon = pickedIcon();
    saveCategories();
    fillCategoryDropdown();
    closeCategoryForm();
    renderTasks(); // tasks and History show the new name and icon straight away
    showMessage("Saved " + category.icon + " " + name);
    return;
  }

  const newCategory = {
    id: "custom-" + Date.now(), // a unique id, e.g. "custom-1697371234567"
    name: name,
    icon: pickedIcon(),
  };
  customCategories.push(newCategory);
  categories = builtInCategories.concat(customCategories);
  saveCategories();

  // Pick the new category for the next task
  fillCategoryDropdown();
  categorySelect.value = newCategory.id;
  lastPickedCategory = newCategory.id;

  closeCategoryForm();
  renderTasks();
  showMessage("Added " + newCategory.icon + " " + name);
  input.focus(); // ready to type a task in the new category
});

document.getElementById("category-cancel").addEventListener("click", closeCategoryForm);

// Typing clears the "please type a name" message, and suggests a matching icon
// (unless you've already picked one yourself)
categoryName.addEventListener("input", function () {
  categoryError.textContent = "";
  if (!iconPickedByHand) {
    pickIcon(guessIcon(categoryName.value));
  }
});

// ---- Edit one of your own categories ----
const editCategoryBtn = document.getElementById("edit-category");
editCategoryBtn.addEventListener("click", function () {
  openEditCategory(getCategory(currentFilter));
});

// ---- Delete one of your own categories ----
// Needs two clicks, like deleting a day from History.
let deleteCategoryTimer;

function resetDeleteCategoryBtn() {
  clearTimeout(deleteCategoryTimer);
  deleteCategoryBtn.dataset.confirm = "";
  deleteCategoryBtn.textContent = "Delete category";
}

deleteCategoryBtn.addEventListener("click", function () {
  const category = getCategory(currentFilter);

  if (deleteCategoryBtn.dataset.confirm !== "yes") {
    // First click: ask to click again
    deleteCategoryBtn.dataset.confirm = "yes";
    deleteCategoryBtn.textContent = "Click again to delete " + category.name;
    deleteCategoryTimer = setTimeout(resetDeleteCategoryBtn, 4000);
    return;
  }

  // Second click: remove the category. Its tasks stay, just without a label.
  customCategories = customCategories.filter(function (item) {
    return item.id !== category.id;
  });
  categories = builtInCategories.concat(customCategories);
  saveCategories();

  currentFilter = "all";
  saveFilter();
  fillCategoryDropdown();
  if (categorySelect.value === "new" || !getCategory(categorySelect.value)) {
    categorySelect.value = categories[0].id; // fall back to the first category
  }
  lastPickedCategory = categorySelect.value;
  renderTasks();
  showMessage("Deleted " + category.name);
});

// ===== 21. Fill the category dropdown =====
// Makes one <option> per category, so the dropdown always matches the list above,
// plus a "+ New category…" option at the end.
function fillCategoryDropdown() {
  const picked = categorySelect.value; // remember the current choice
  categorySelect.innerHTML = "";

  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = iconFor(category) + " " + category.name;
    categorySelect.appendChild(option);
  });

  const newOption = document.createElement("option");
  newOption.value = "new";
  newOption.textContent = "+ New category…";
  categorySelect.appendChild(newOption);

  // Put the previous choice back, if it still exists
  if (getCategory(picked)) {
    categorySelect.value = picked;
  }
}

// The dropdown's choice before the latest change (so "+ New category…" can undo itself)
let lastPickedCategory;

categorySelect.addEventListener("change", function () {
  if (categorySelect.value === "new") {
    categorySelect.value = lastPickedCategory; // don't leave "+ New category…" selected
    openCategoryForm();
  } else {
    lastPickedCategory = categorySelect.value;
  }
});

fillCategoryDropdown();

// If the app opens on a category view, pick that category in the dropdown too
if (getCategory(currentFilter)) {
  categorySelect.value = currentFilter;
} else {
  currentFilter = "all"; // the saved filter no longer exists, so show everything
}
lastPickedCategory = categorySelect.value;

// Only "all", "active" and "done" are real statuses
if (!["all", "active", "done"].includes(currentStatus)) {
  currentStatus = "all";
}

// ===== 22. Set up the date box =====
// Starts on today, and doesn't allow picking a day in the past.
dateInput.value = todayKey();
dateInput.min = todayKey();

// ===== 23. Show today's date under the title =====
// toLocaleDateString formats the date in a friendly way,
// for example "Thursday, October 15".
document.getElementById("today").textContent = new Date().toLocaleDateString(
  undefined,
  { weekday: "long", month: "long", day: "numeric" }
);

// ===== 24. End-of-day reminder =====
// Note: a web page can only remind you while it's open in a browser tab.
const reminderBanner = document.getElementById("reminder-banner");
const reminderText = document.getElementById("reminder-text");
const reminderOn = document.getElementById("reminder-on");
const reminderTime = document.getElementById("reminder-time");
const reminderNote = document.getElementById("reminder-note");

// The current time as "HH:MM", e.g. "20:05".
// Times written like this can be compared as text: "19:30" < "20:00" is true.
function nowHHMM() {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
}

// Turns "20:00" into a friendly time like "8:00 PM" (or "20:00", depending on the computer)
function friendlyTime(hhmm) {
  return new Date("2000-01-01T" + hhmm).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Shows a pop-up notification, if the browser allows it (see the checkbox below)
function sendNotification(text) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("My To-Do List", { body: text });
    }
  } catch (error) {
    // Some browsers don't allow notifications here; the reminder on the page still works
  }
}

// Decides whether to show the reminder. Runs when tasks change and once a minute.
function checkReminder() {
  // Today's tasks that aren't done yet
  const left = tasks.filter(function (task) {
    return isForToday(task) && !task.done;
  }).length;

  // Time to remind: switched on, past the reminder time, and something is left
  const due = reminder.on && nowHHMM() >= reminder.time && left > 0;

  // The message, e.g. "Lady J, you still have 2 tasks to finish today."
  const name = profile ? profile.name + ", you" : "You";
  const message = name + " still have " + left + (left === 1 ? " task" : " tasks") + " to finish today.";

  // Show the reminder on the page, unless you dismissed it today
  reminderBanner.hidden = !(due && reminder.dismissedOn !== todayKey());
  reminderText.textContent = message;

  // Send a pop-up notification once a day
  if (due && reminder.notifiedOn !== todayKey()) {
    sendNotification(message);
    reminder.notifiedOn = todayKey();
    saveReminder();
  }
}

// Explains the setting under the checkbox
function updateReminderNote() {
  if (reminder.on) {
    reminderNote.textContent = "At " + friendlyTime(reminder.time) +
      ", you'll get a reminder here if any of today's tasks are left. It only works while this page is open.";
  } else {
    reminderNote.textContent = "";
  }
}

// Fill in the setting from what's saved
reminderOn.checked = reminder.on;
reminderTime.value = reminder.time;
updateReminderNote();

// Switching the reminder on or off
reminderOn.addEventListener("change", function () {
  reminder.on = reminderOn.checked;
  saveReminder();
  updateReminderNote();

  // Ask the browser for permission to show pop-up notifications.
  // (Browsers only allow asking right after a click like this one.)
  if (reminder.on) {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch (error) {}
  }
  checkReminder();
});

// Changing the reminder time
reminderTime.addEventListener("change", function () {
  reminder.time = reminderTime.value || "20:00"; // empty box: back to 8 PM
  reminder.dismissedOn = ""; // a new time means a fresh reminder today
  reminder.notifiedOn = "";
  saveReminder();
  updateReminderNote();
  checkReminder();
});

// "Dismiss": hide the reminder for the rest of today
document.getElementById("reminder-dismiss").addEventListener("click", function () {
  reminder.dismissedOn = todayKey();
  saveReminder();
  checkReminder();
});

// ===== 25. Draw everything when the page first loads =====
renderTasks();

// ===== 26. Welcome screen =====
const welcomeForm = document.getElementById("welcome-form");
const welcomeTitle = document.getElementById("welcome-title");
const welcomeSubmit = document.getElementById("welcome-submit");
const nameInput = document.getElementById("welcome-name");
const welcomeError = document.getElementById("welcome-error");
const greetingName = document.getElementById("greeting-name");

// Puts the user's name in the "Hi, ..." greeting
function showGreeting() {
  greetingName.textContent = profile ? profile.name : "";
}

// Shows the welcome screen (and hides the list).
// The CSS does the hiding: it looks for the "needs-profile" class on <html>.
function showWelcome() {
  document.documentElement.classList.add("needs-profile");
  welcomeError.textContent = "";
  nameInput.focus();
}

welcomeForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stay on the page

  const name = nameInput.value.trim();
  // welcomeForm.elements.gender is the group of radio buttons;
  // its .value is the picked one's value, or "" if none is picked.
  const gender = welcomeForm.elements.gender.value;

  // Check the answers and explain what's missing
  if (name === "") {
    welcomeError.textContent = "Please enter your name.";
    nameInput.focus();
    return;
  }
  if (gender === "") {
    welcomeError.textContent = "Please choose an option for gender.";
    return;
  }

  // All good: save the details and show the to-do list
  profile = { name: name, gender: gender };
  saveProfile();
  showGreeting();
  document.documentElement.classList.remove("needs-profile");
  input.focus(); // put the cursor in the "What do you need to do?" box
});

// As soon as the user types or picks an option, clear the "please fill in" message.
// The "input" event fires for typing in the box and for clicking a radio button.
welcomeForm.addEventListener("input", function () {
  welcomeError.textContent = "";
});

// The pencil button next to the greeting: reopen the form with the saved details filled in
const welcomeCancel = document.getElementById("welcome-cancel");

document.getElementById("change-profile").addEventListener("click", function () {
  nameInput.value = profile.name;
  welcomeForm.elements.gender.value = profile.gender; // ticks the matching radio button
  welcomeTitle.textContent = "Edit your details";
  document.getElementById("welcome-intro").textContent = "Update your name or gender.";
  welcomeSubmit.textContent = "Save";
  welcomeCancel.hidden = false; // you can go back without saving
  showWelcome();
});

// Cancel: go back to the list without saving anything
welcomeCancel.addEventListener("click", function () {
  document.documentElement.classList.remove("needs-profile");
  document.getElementById("change-profile").focus(); // put keyboard focus back where it was
});

showGreeting();
if (!profile) {
  showWelcome();
}

// ===== 27. Dark mode toggle =====
const themeToggle = document.getElementById("theme-toggle");

// Is the page dark right now? Either you picked dark with the toggle,
// or you haven't picked anything and your computer is in dark mode.
function isDark() {
  const picked = document.documentElement.dataset.theme; // "dark", "light" or undefined
  if (picked) {
    return picked === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Shows the icon for the mode you'd switch TO: a moon in light mode, a sun in dark mode
function updateThemeButton() {
  if (isDark()) {
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    themeToggle.textContent = "🌙";
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  }
  themeToggle.title = themeToggle.getAttribute("aria-label"); // tooltip on hover
}

themeToggle.addEventListener("click", function () {
  const newTheme = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = newTheme; // the CSS reacts to this
  localStorage.setItem("theme", newTheme); // remember it for next time
  updateThemeButton();
});

// If you haven't picked a mode and your computer switches (e.g. at sunset), update the icon
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateThemeButton);

updateThemeButton();

// ===== 28. Keep up when the day changes =====
// If the app is left open past midnight, tomorrow's tasks should move into
// today's list. Once a minute, we check whether the date has changed,
// and whether it's time for the end-of-day reminder.
let shownDay = todayKey();
setInterval(function () {
  if (todayKey() !== shownDay) {
    shownDay = todayKey();
    document.getElementById("today").textContent = new Date().toLocaleDateString(
      undefined,
      { weekday: "long", month: "long", day: "numeric" }
    );
    dateInput.min = todayKey();
    if (dateInput.value < todayKey()) {
      dateInput.value = todayKey();
    }
    renderTasks();
  }
  checkReminder(); // is it time for the end-of-day reminder?
}, 60 * 1000); // 60 seconds, in milliseconds
