
//  EcoClean – edit-event.js

//  STATE 
const eventId = new URLSearchParams(window.location.search).get("id");
let selectedFile = null;
let currentImageUrl = "";

//  FETCH EVENT 
async function fetchEventDetails() {

  try {
    // Show skeleton
    document.getElementById('form-skeleton').style.display = 'block';
    document.getElementById('form-content').style.display = 'none';

    const res = await apiRequest(`/events/${eventId}`, "GET", null, false);
    if (!res) return;

    if (res.ok) {
      const event = await res.json();

      // Fill form
      document.getElementById('title').value = event.title;
      document.getElementById('description').value = event.description;
      document.getElementById('location').value = event.location;
      document.getElementById('event_date').value = event.event_date;
      document.getElementById('start_time').value = event.start_time;
      document.getElementById('end_time').value = event.end_time;

      currentImageUrl = event.image_url;

      // Handle Image Preview
      if (currentImageUrl) {
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const actions = document.getElementById('image-actions');

        if (preview) {
          preview.src = currentImageUrl;
          preview.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (actions) actions.style.display = 'block';
      }

      // If event is completed, disable the form
      if (event.status === 'completed') {
        document.getElementById('completed-banner').style.display = 'flex';
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('submit-btn').style.opacity = '0.5';
      }

      // Show content
      document.getElementById('form-skeleton').style.display = 'none';
      document.getElementById('form-content').style.display = 'block';
    } else {
      alert("Could not find the event.");
      window.location.href = "admin.html";
    }
  } catch (err) {
    console.error(err);
    alert("Server error while loading event data.");
  }
}

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
  currentImageUrl = "";
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
async function handleEditEvent(event) {
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

  try {
    // Show loading state
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-block';
    submitBtn.disabled = true;

    let finalImageUrl = currentImageUrl;

    // 1. Upload new image if one is selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('file', selectedFile);

      try {
        const uploadRes = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.secure_url;
        } else {
          const errorData = await uploadRes.json();
          console.error("Cloudinary Upload Failed:", errorData);
          alert(`Cloudinary Upload Failed: ${errorData.error?.message || "Check your Cloud Name and Preset in config.js"}`);
          return; // Stop the process if upload was intended but failed
        }
      } catch (err) {
        console.error("Cloudinary Network Error:", err);
        alert("Network error while uploading to Cloudinary.");
        return;
      }
    }

    // 2. Update the event
    const eventData = {
      title,
      description,
      location,
      event_date,
      start_time,
      end_time,
      image_url: finalImageUrl
    };

    const response = await apiRequest(`/events/${eventId}`, "PUT", eventData);

    if (response && response.ok) {
      alert('Event updated successfully!');
      window.location.href = 'admin.html';
    } else {
      const data = response ? await response.json() : { detail: 'Unknown error' };
      alert('Update failed: ' + (data.detail || 'check your inputs'));
    }

  } catch (err) {
    console.error(err);
    alert("An error occurred during update.");
  } finally {
    if (btnText) btnText.style.display = 'inline-block';
    if (btnLoading) btnLoading.style.display = 'none';
    submitBtn.disabled = false;
  }
}

//  INIT 
if (eventId) {
  fetchEventDetails();
}

// Global exposure
window.handleEditEvent = handleEditEvent;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;