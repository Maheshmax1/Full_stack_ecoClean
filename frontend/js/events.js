// Load events
async function fetchPublicEvents() {
  try {
    // We try with token if available
    const response = await apiRequest("/events/", "GET", null, false);

    if (!response.ok) {
      showError("Server Error: " + response.status);
      return;
    }

    const events = await response.json();
    renderEvents(events);
  } catch (err) {
    showError("Network error. Check backend server.");
    console.error(err);
  }
}

// Render Events
function renderEvents(events) {
  const upcomingList = document.getElementById("upcoming-events-list");
  const completedList = document.getElementById("completed-events-list");

  if (upcomingList) upcomingList.innerHTML = "";
  if (completedList) completedList.innerHTML = "";

  const upcoming = events.filter((e) => e.status === "upcoming");
  const completed = events.filter((e) => e.status === "completed");

  // Upcoming
  if (upcoming.length === 0) {
    if (upcomingList)
      upcomingList.innerHTML = `<p style="text-align:center;padding:20px;">No upcoming events now.</p>`;
  } else if (upcomingList) {
    upcoming.forEach((e) => upcomingList.appendChild(createEventCard(e, true)));
  }

  // Completed
  if (completed.length === 0) {
    if (completedList)
      completedList.innerHTML = `<p style="text-align:center;padding:20px;">No completed events.</p>`;
  } else if (completedList) {
    completed.forEach((e) =>
      completedList.appendChild(createEventCard(e, false)),
    );
  }
}

// Create Event Card
function createEventCard(event, isUpcoming) {
  const div = document.createElement("div");
  div.className = "event-card";

  let statusText;
  let statusClass;

  if (isUpcoming) {
    statusText = "Know More";
    statusClass = "status-upcoming";
  } else {
    statusText = "✓ Completed";
    statusClass = "status-completed";
  }

  // If user registered
  if (isUpcoming && event.is_registered) {
    statusText = "✓ Registered";
    statusClass = "status-registered";
    div.classList.add("registered");
  }

  const link = isUpcoming ? `./about-event.html?id=${event.id}` : "#";

  div.innerHTML = `
    <div class="event-image-container">
        <img src="${event.image_url.startsWith('http') ? event.image_url : API_URL + event.image_url}" 
             alt="${event.title}" 
             onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'">
    </div>
    <div class="event-content">
      <span class="event-id">ECO-EVENT-${event.id}</span>
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <div class="event-details">
        <div> ${event.event_date}</div>
        <div> ${event.start_time} - ${event.end_time}</div>
      </div>
      ${isUpcoming
      ? `<a href="${link}">
               <span class="event-status ${statusClass}">
                 ${statusText}
               </span>
             </a>`
      : `<span class="event-status ${statusClass}">
               ${statusText}
             </span>`
    }
    </div>
  `;

  return div;
}

// Auto load
if (window.location.pathname.includes("events.html")) {
  fetchPublicEvents();
}
