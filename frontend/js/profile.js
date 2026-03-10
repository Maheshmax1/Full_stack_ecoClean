
// for showing the user details 
async function fetchProfile() {

    // redirect if the user is not login 
    if (!getToken()) {
        console.warn("no authentication found! Redirecting to login...")
        handleAuthError();
        return;
    }

    try {
        console.log("fetching user profile")
        const response = await apiRequest("/users/me");

        if (!response) return; // handled by apiRequest 401

        if (response.ok) {
            const user = await response.json();
            console.log('profile data received', user);

            // showing the user details 
            const welcomeText = document.querySelector('.profile-text h1');
            if (welcomeText) welcomeText.textContent = `Welcome, ${user.full_name}`;

            const volId = document.getElementById('vol-id');
            if (volId) volId.textContent = `ECO-VOL-${user.id}`;

            const volEmail = document.getElementById('vol-email');
            if (volEmail) volEmail.textContent = user.email;

            // load registered events list 
            fetchMyEvents();
        } else {
            const list = document.getElementById('registered-events-list');
            if (list) list.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Failed to load profile. Status: ${response.status}<p>`;
        }
    } catch (err) {
        console.error("failed to connect to backend", err)
        const list = document.getElementById('registered-events-list');
        if (list) list.innerHTML = `<p style="color:red; text-align:center; padding:20px;">backend error server is not reached <p>`
    }
}

// fetch myEvents 
async function fetchMyEvents() {
    const list = document.getElementById('registered-events-list');
    if (!list) return;

    try {
        console.log("fetching user events list");
        const response = await apiRequest("/users/me/events");

        if (!response) return;

        if (response.ok) {
            const registrations = await response.json();

            // clear loading placeholder 
            list.innerHTML = "";

            if (registrations.length === 0) {
                list.innerHTML = `
                <p style="text-align: center; width: 100%; padding: 20px;">
                        You haven't joined any events yet. 
                        <a href="events.html" style="color: #2e7d32; font-weight: bold;">Browse events!</a>
                    </p>`;
                return;
            }

            registrations.forEach(reg => {
                const event = reg.event;
                if (!event) return;

                const card = document.createElement('a');
                card.href = `about-event.html?id=${event.id}`;
                card.className = "event-card";
                card.style.textDecoration = "none";

                card.innerHTML = `
                    <div class="card-image-wrapper">
                        <img src="${event.image_url.startsWith('http') ? event.image_url : API_URL + event.image_url}" 
                             alt="${event.title}" 
                             class="card-image" 
                             onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80'">
                        <span class="status-badge upcoming">Registered</span>
                    </div>
                    <div class="card-content">
                        <h3>${event.title}</h3>
                        <p class="location">📍 ${event.location}</p>
                        <p class="date">📅 ${event.event_date}</p>
                    </div>
                `;
                list.appendChild(card);
            });

        } else {
            list.innerHTML = `<p style="text-align: center; padding: 20px;">Failed to load events. Status: ${response.status}</p>`;
        }
    } catch (err) {
        console.error('failed to load the registered events', err);
        list.innerHTML = `<p style="text-align: center; color: red; padding: 20px;">Failed to fetch registered events. Check your connection.</p>`;
    }
}

if (window.location.pathname.includes('profile.html')) {
    fetchProfile();
}
