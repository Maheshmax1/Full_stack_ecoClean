document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navMenu = document.getElementById("nav-menu");

  if (!navMenu || !token) return;

  // Decide profile path
  const insidePages = window.location.pathname.includes("/pages/");
  const profilePath = role === "admin"
    ? (insidePages ? "admin.html" : "pages/admin.html")
    : (insidePages ? "profile.html" : "pages/profile.html");

  // Change Login / Signup links
  navMenu.querySelectorAll("a").forEach(link => {
    const text = link.textContent.toLowerCase();

    if (text.includes("login") || text.includes("sign")) {
      link.textContent = role === "admin" ? "Dashboard" : "Profile";
      link.href = profilePath;
    }
  });

  // Hide auth section if exists
  const authSection = document.getElementById("auth-section");
  if (authSection) authSection.style.display = "none";
});


// Logout Function
function logout(e) {
  if (e) e.preventDefault();

  localStorage.clear(); // clears token + role
  alert("Logged out successfully");

  const insidePages = window.location.pathname.includes("/pages/");
  window.location.href = insidePages ? "../index.html" : "index.html";
}

window.logout = logout;