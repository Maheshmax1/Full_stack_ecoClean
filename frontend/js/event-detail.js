
// ================== STATE ==================
const eventId = new URLSearchParams(window.location.search).get("id");

// ================== LOAD EVENT ==================
async function fetchEventDetails() {

  if (!eventId) {
    alert("No event selected");
    window.location.href = "events.html";
    return;
  }

  try {
    // Request with token if logged in, but don't force login (requireAuth=false)
    const res = await apiRequest(`/events/${eventId}`, "GET", null, false);

    if (!res || !res.ok) {
      alert("Event not found");
      return;
    }

    const event = await res.json();

    // Fill basic details
    document.title = event.title;
    const titleEle = document.getElementById("event-title");
    const dateEle = document.getElementById("event-date");
    const timeEle = document.getElementById("event-time");
    const locEle = document.getElementById("event-location");
    const descEle = document.getElementById("event-description");

    if (titleEle) titleEle.textContent = event.title;
    if (dateEle) dateEle.textContent = "Date: " + event.event_date;
    if (timeEle) timeEle.textContent = "Time: " + event.start_time + " - " + event.end_time;
    if (locEle) locEle.textContent = "Location: " + event.location;
    if (descEle) descEle.textContent = event.description;

    // Image with fallback
    const img = document.getElementById("event-image");
    if (img) {
      img.src = event.image_url.startsWith('http') ? event.image_url : API_URL + event.image_url;
      img.onerror = () => {
        img.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80";
      };
    }

    // Volunteers list
    const section = document.getElementById("registered-volunteers-section");
    const list = document.getElementById("volunteers-list");

    if (event.registrations && event.registrations.length > 0) {
      if (section) section.style.display = "block";
      if (list) {
        list.innerHTML = "";
        event.registrations.forEach(reg => {
          const li = document.createElement("li");
          li.textContent = reg.user.full_name;
          list.appendChild(li);
        });
      }
    } else {
      if (section) section.style.display = "none";
    }

    // Join / Leave button logic
    const btn = document.querySelector(".btn");
    if (btn) {
      if (event.is_registered) {
        // Create a wrapper for both buttons to sit side-by-side
        const actionWrapper = document.createElement("div");
        actionWrapper.style.display = "flex";
        actionWrapper.style.alignItems = "center";
        actionWrapper.style.gap = "15px";
        actionWrapper.style.marginTop = "20px";

        // Put the wrapper where the button used to be
        btn.parentNode.insertBefore(actionWrapper, btn);

        // Style the "Already Registered" badge
        btn.textContent = "✓ Already Registered";
        btn.style.backgroundColor = "#2e8b57";
        btn.style.color = "white";
        btn.style.cursor = "default";
        btn.style.border = "none";
        btn.style.padding = "10px 20px";
        btn.style.borderRadius = "25px";
        btn.style.fontSize = "1rem";
        btn.style.margin = "0"; // Reset margin
        btn.href = "javascript:void(0)";

        // Create the "Leave" button
        const leaveBtn = document.createElement("button");
        leaveBtn.textContent = "Leave Event";
        leaveBtn.style.backgroundColor = "transparent";
        leaveBtn.style.color = "#ff4d4d";
        leaveBtn.style.border = "1px solid #ff4d4d";
        leaveBtn.style.padding = "10px 20px";
        leaveBtn.style.borderRadius = "25px";
        leaveBtn.style.cursor = "pointer";
        leaveBtn.style.fontSize = "0.95rem";
        leaveBtn.style.transition = "all 0.3s";

        // Hover effect for the red button
        leaveBtn.onmouseover = () => {
          leaveBtn.style.backgroundColor = "#ff4d4d";
          leaveBtn.style.color = "white";
        };
        leaveBtn.onmouseout = () => {
          leaveBtn.style.backgroundColor = "transparent";
          leaveBtn.style.color = "#ff4d4d";
        };

        leaveBtn.onclick = () => leaveEvent(event.id);

        // Add both to the flex wrapper
        actionWrapper.appendChild(btn);
        actionWrapper.appendChild(leaveBtn);

      } else {
        btn.onclick = (e) => {
          e.preventDefault();
          joinEvent(event.id);
        };
      }
    }

  } catch (err) {
    console.error(err);
    alert("Server error while loading event");
  }
}


// ================== JOIN EVENT ==================
async function joinEvent(id) {
  if (!getToken()) {
    alert("Please login first to join events!");
    window.location.href = "../index.html#auth-section";
    return;
  }

  try {
    const res = await apiRequest(`/events/${id}/join`, "POST");

    if (!res) return; // Handled by apiRequest (401)

    if (res.ok) {
      alert("Successfully joined the event!");
      location.reload(); // Refresh to show "Registered" state
    } else {
      const data = await res.json();
      alert("Error: " + (data.detail || "Could not join event"));
    }

  } catch (err) {
    console.error(err);
    alert("Connection error");
  }
}

// ================== LEAVE EVENT ==================
async function leaveEvent(id) {
  if (!confirm("Are you sure you want to leave this event?")) return;

  try {
    const res = await apiRequest(`/events/${id}/leave`, "POST");

    if (res && res.ok) {
      alert("You have left the event.");
      location.reload(); // Refresh to show "Join" button again
    } else {
      const data = await res.json();
      alert("Error: " + (data.detail || "Could not leave event"));
    }
  } catch (err) {
    console.error(err);
    alert("Connection error while trying to leave event.");
  }
}


// ================== AUTO LOAD ==================
if (window.location.pathname.includes("about-event.html")) {
  fetchEventDetails();
}

// Global exposure
window.joinEvent = joinEvent;
window.leaveEvent = leaveEvent;