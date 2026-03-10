
//  EcoClean – contact.js

const contactForm = document.querySelector('.support-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const category = document.getElementById('category').value;
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        const priority = document.getElementById('priority').value;

        //  Check if all boxes are filled
        if (!name || !email || !phone || !category || !subject || !message || !priority) {
            alert(' Please fill out all parts of the form before submitting!');
            return;
        }

        //   check for valid email format
        if (!email.includes('@') || !email.includes('.')) {
            alert(' Please enter a valid email address!');
            return;
        }

        const messageData = {
            name: name,
            email: email,
            phone: phone,
            category: category,
            subject: subject,
            message: message,
            priority: priority
        };

        try {
            // No auth required for contact form
            const response = await apiRequest("/contact/", "POST", messageData, false);

            if (response && response.ok) {
                alert(' Success! Your message has been received.');
                contactForm.reset();
            } else {
                const error = response ? await response.json() : { detail: "Unknown error" };
                alert(' Transmission Error: ' + (error.detail || 'Service unavailable. Please retry later.'));
            }
        } catch (err) {
            console.error(err);
            alert(' Network Error: Connectivity lost. Please check your internet or server status.');
        }
    });
}
