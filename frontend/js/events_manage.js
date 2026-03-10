//  BASE
const apiBase =
  typeof API_URL !== "undefined" ? API_URL : "http://localhost:8000";

const token = localStorage.getItem("token");

// FETCH REGISTRATIONS
async function fetchEventRegistrations() {
  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${apiBase}/admin/event-registrations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Failed to load registrations");
      return;
    }

    const events = await res.json();
    const container = document.querySelector(".registrations-container");
    // if (!container) return;

    container.innerHTML = "";

    if (!events.length ===0) {
      container.innerHTML = "<p>No events found.</p>";
      return;
    }

    events.forEach((event) => {
      const card = document.createElement("div");
      card.className = "registration-event-card";

      let tableContent = "";

      if (event.registrations && event.registrations.length > 0) {
        tableContent = `
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${event.registrations
                .map(
                  (reg) => `
                <tr>
                  <td>${reg.user.full_name}</td>
                  <td>${reg.user.email}</td>
                  <td>${reg.user.phone || "N/A"}</td>
                  <td>Joined</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        `;
      } else {
        tableContent = "<p>No registrations yet.</p>";
      }

      card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.location} | ${event.event_date}</p>
        <p>Total Registrations: ${event.registrations.length}</p>
        ${tableContent}
        <hr>
      `;

      container.appendChild(card);
    });
  } catch {
    alert("Server connection error");
  }
}

//  AUTO LOAD
fetchEventRegistrations();
