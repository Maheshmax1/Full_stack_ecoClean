



// ANIMATE VALUE 

function animateValue(id, end) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;
  const duration = 1000;
  const startTime = Date.now();

  function update() {
    const progress = Math.min((Date.now() - startTime) / duration, 1);
    el.textContent = Math.floor(progress * end);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}


// FETCH STATS 

async function fetchStats() {
  const res = await apiRequest("/admin/stats");
  if (!res) return;

  const data = await res.json();

  animateValue("stat-upcoming-count", data.upcoming_events);
  animateValue("stat-completed-count", data.completed_events);
}


// FETCH EVENTS 
async function fetchAdminEvents() {
  const res = await apiRequest("/events/");
  if (!res.ok) return;

  const events = await res.json();
  const list = document.getElementById("admin-events-list");
  if (!list) return;

  list.innerHTML = "";

  if (!events.length) {
    list.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach(event => {
    const div = document.createElement("div");
    div.className = "event-item";
    div.innerHTML = `
      <div class="event-info">
        <span class="event-id">ID: #${event.id}</span>
        <h3 class="event-name">${event.title}</h3>
        <p class="event-time"><i class="far fa-calendar-alt"></i> ${event.event_date} | <i class="far fa-clock"></i> ${event.start_time}</p>
      </div>
      <div class="event-actions">
        <button class="action-btn edit-btn" onclick="window.location.href='edit-event.html?id=${event.id}'">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="action-btn view-btn" onclick="markCompleted(${event.id})">
          <i class="fas fa-check"></i> Done
        </button>
        <button class="action-btn delete-btn" onclick="deleteEvent(${event.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}


// MARK COMPLETED 
async function markCompleted(id) {
  if (!confirm("Mark as completed?")) return;

  const res = await apiRequest(`/events/${id}`, "PUT", {
    status: "completed"
  });

  if (!res) return;

  alert("Event updated");
  fetchAdminEvents();
  fetchStats();
}


// DELETE EVENT 

async function deleteEvent(id) {
  if (!confirm("Delete event?")) return;

  const res = await apiRequest(`/events/${id}`, "DELETE");
  if (!res) return;

  alert("Event deleted");
  fetchAdminEvents();
  fetchStats();
}


// FETCH VOLUNTEERS
async function fetchVolunteers() {
  const res = await apiRequest("/admin/volunteers");
  if (!res || !res.ok) return;

  const users = await res.json();
  const list = document.getElementById("volunteer-applications-list");
  if (!list) return;

  list.innerHTML = "";
  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>Volunteer</td>
      <td>${user.phone}</td>
    `;
    list.appendChild(tr);
  });
}

// FETCH MESSAGES
async function fetchMessages() {
  const res = await apiRequest("/admin/messages");
  if (!res || !res.ok) return;

  const messages = await res.json();
  const list = document.getElementById("admin-messages-list");
  if (!list) return;

  list.innerHTML = "";
  if (!messages.length) {
    list.innerHTML = "<p>No messages yet.</p>";
    return;
  }

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message-card";
    div.innerHTML = `
      <span class="message-category-tag">${msg.category}</span>
      <span class="priority-badge priority-${msg.priority.toLowerCase()}">${msg.priority}</span>
      <h3 style="margin: 10px 0;">${msg.subject}</h3>
      <p style="color: #666; font-size: 0.9rem;">From: <strong>${msg.name}</strong> (${msg.email})</p>
      <p style="margin-top: 15px; background: #f9f9f9; padding: 10px; border-radius: 6px;">${msg.message}</p>
      <div style="margin-top: auto; padding-top: 15px;">
        <button class="action-btn delete-btn" onclick="deleteMessage(${msg.id})">
          <i class="fas fa-check"></i> Mark Solved
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}

async function deleteMessage(id) {
  if (!confirm("Mark this message as solved?")) return;
  const res = await apiRequest(`/admin/messages/${id}`, "DELETE");
  if (res && res.ok) {
    fetchMessages();
  }
}

// FETCH REGISTRATIONS
async function fetchRegistrations() {
  const res = await apiRequest("/admin/event-registrations");
  if (!res || !res.ok) return;

  const events = await res.json();
  const container = document.getElementById("registrations-container");
  if (!container) return;

  container.innerHTML = "";
  events.forEach(event => {
    if (event.registrations && event.registrations.length > 0) {
      const div = document.createElement("div");
      div.className = "card";
      div.style.marginBottom = "20px";
      div.innerHTML = `
        <h3 style="color: #2e8b57; margin-bottom: 15px;">${event.title} (${event.registrations.length} Joined)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              ${event.registrations.map(reg => `
                <tr>
                  <td>${reg.user.full_name}</td>
                  <td>${reg.user.email}</td>
                  <td>${reg.user.phone}</td>
                  <td>${new Date(reg.registration_date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.appendChild(div);
    }
  });

  if (container.innerHTML === "") {
    container.innerHTML = "<p>No registrations found for any event.</p>";
  }
}


// LOGOUT 

function logout() {
  localStorage.clear();
  window.location.href = "../index.html";
}


// INIT 

if (window.location.pathname.includes("admin.html")) {
  const role = localStorage.getItem("role");

  if (getToken() && role === "admin") {
    fetchStats();
    fetchAdminEvents();
    fetchVolunteers();
    fetchMessages();
    fetchRegistrations();
  } else {
    window.location.href = "../index.html";
  }
}