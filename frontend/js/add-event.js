
//  EcoClean – add-event.js

// Global variable to store the selected image file
let selectedFile = null;

//  IMAGE PREVIEW & UPLOAD 
function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        selectedFile = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const preview = document.getElementById('image-preview');
            const placeholder = document.getElementById('upload-placeholder');
            const actions = document.getElementById('image-actions');

            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            if (actions) {
                actions.style.display = 'block';
            }
        }

        reader.readAsDataURL(selectedFile);
    }
}

function removeImage() {
    selectedFile = null;
    const input = document.getElementById('image_file');
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const actions = document.getElementById('image-actions');

    if (input) input.value = '';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (actions) actions.style.display = 'none';
}

//  FORM SUBMISSION 
async function handleAddEvent(event) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    const event_date = document.getElementById('event_date').value;
    const start_time = document.getElementById('start_time').value;
    const end_time = document.getElementById('end_time').value;

    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Basic validation
    if (!title || !description || !location || !event_date || !start_time || !end_time) {
        alert('Please fill in all required fields.');
        return;
    }

    if (end_time <= start_time) {
        alert('End Time must be later than Start Time.');
        return;
    }

    try {
        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';
        submitBtn.disabled = true;

        let image_url = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"; // Default

        // 1. Upload image first if one is selected
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            try {
                const uploadRes = await fetch(CLOUDINARY_URL, {
                    method: "POST",
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    image_url = uploadData.secure_url; // Cloudinary's secure URL
                } else {
                    console.warn("Cloudinary upload failed, using default.");
                }
            } catch (err) {
                console.error("Cloudinary Error:", err);
            }
        }

        // 2. Create the event
        const eventData = {
            title,
            description,
            location,
            event_date,
            start_time,
            end_time,
            image_url,
            status: 'upcoming'
        };

        const response = await apiRequest("/events/", "POST", eventData);

        if (response && response.ok) {
            alert('New event has been created successfully!');
            window.location.href = 'admin.html';
        } else {
            const data = response ? await response.json() : { detail: 'Unknown error' };
            alert('Failed to create event: ' + (data.detail || 'check your inputs'));
        }

    } catch (err) {
        console.error(err);
        alert("An error occurred. Please check console.");
    } finally {
        // Reset button state
        if (btnText) btnText.style.display = 'inline-block';
        if (btnLoading) btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Global exposure
window.handleAddEvent = handleAddEvent;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;
