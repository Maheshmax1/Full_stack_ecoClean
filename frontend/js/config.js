
const API_URL = '/api'; // Use relative path for Vercel deployment

//  CLOUDINARY CONFIG 
// REPLACE 'your_cloud_name' and 'your_upload_preset' with your actual Cloudinary details
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/def2x8hlo/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Fullstack_Ecoclean';

//  GLOBAL HELPERS 

function getToken() {
    return localStorage.getItem("token");
}

function getRole() {
    return localStorage.getItem("role");
}

function handleAuthError() {
    console.warn("Session expired or unauthorized. Redirecting...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Determine redirect path based on current location
    const insidePages = window.location.pathname.includes("/pages/");
    window.location.href = insidePages ? "../index.html" : "index.html";
}

async function apiRequest(endpoint, method = "GET", body = null, requireAuth = true) {
    const token = getToken();
    const headers = {
        "Accept": "application/json"
    };

    // Only set Content-Type to JSON if the body is NOT FormData
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // If we have a token, always send it so the backend knows who we are
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null)
        });

        // Only force redirect if the page explicitly requires authentication
        if (response.status === 401 && requireAuth) {
            handleAuthError();
            return null;
        }

        return response;
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}

