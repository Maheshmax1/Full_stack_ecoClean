
// signup form 
async function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const fullname = form.fullname.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;

    const userData = {
        full_name: fullname,
        email: email,
        phone: phone,
        password: password
    };

    try {
        const response = await apiRequest("/auth/signup", "POST", userData, false);

        if (response && response.ok) {
            alert("Account created successfully. Please login.");
            location.reload();
        } else {
            const data = response ? await response.json() : { detail: "Signup failed" };
            alert(data.detail || "Signup failed");
        }

    } catch (err) {
        console.error(err);
        alert("Connectivity error during signup.");
    }
}

// login form 
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const credentials = { email, password };

    try {
        // We removed the hardcoded 'admin@ecoclean.com' check 
        // to let the backend provide a REAL token for admin accounts.
        const response = await apiRequest("/auth/login", "POST", credentials, false);

        if (response && response.ok) {
            const data = await response.json();

            // SAVE TOKEN AND ROLE
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);

            alert("Login successful");

            // Redirect based on role and current path
            const insidePages = window.location.pathname.includes("/pages/");

            if (data.role === "admin") {
                // If we are in root, go to pages/admin.html. If in pages, go to admin.html
                window.location.href = insidePages ? 'admin.html' : 'pages/admin.html';
            } else {
                window.location.href = insidePages ? 'profile.html' : 'pages/profile.html';
            }

        } else {
            const data = response ? await response.json() : { detail: "Login failed" };
            alert(data.detail || "Invalid email or password");
        }

    } catch (err) {
        console.error("Login Error:", err);
        alert('Could not connect to server. Is the backend running?');
    }
}

// Global exposure for form handlers
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
