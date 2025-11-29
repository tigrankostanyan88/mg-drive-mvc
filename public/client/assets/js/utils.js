(function scrollAnimation() {
    // Callback function for the IntersectionObserver
    function callback(entries, observer) {
        entries.forEach(entry => {
            const target = entry.target;


            // As the element enters the viewport, we scale and move it up
            if (entry.intersectionRatio > 0) {
                // Set a translateY value based on intersectionRatio to animate the element from bottom
                target.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-in-out';
                target.style.transform = `translateY(${(1 - entry.intersectionRatio) * 100}px)`; // Move from below
                target.style.opacity = entry.intersectionRatio; // Fade in based on visibility
            } else {
                // Reset properties when out of view
                target.style.transform = 'translateY(100px)';
                target.style.opacity = '0';
            }
        });
    }

    // Define observer options
    const options = {
        threshold: Array.from({
            length: 101
        }, (_, i) => i / 100),
    };

    // Create a new IntersectionObserver instance
    let observer = new IntersectionObserver(callback, options);

    // Observe each '.project' element
    document.querySelectorAll('.scroll_animate').forEach(target => {
        observer.observe(target);
    });
})();

// Bootstrap input falidation
function validateBootstrap(form) {
    'use strict';
    let isValid = true;

    form.querySelectorAll('input, textarea').forEach(input => {
        input.value = input.value.trim();
        if (!input.checkValidity()) isValid = false;
    });

    // Bootstrap validation
    if (!form.checkValidity()) {
        isValid = false;
    }

    form.classList.add('was-validated');
    return isValid;
}

async function doAxios(url, method = 'GET', data = {}) {
    try {
        const response = await axios({
            url,
            method,
            data,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return {
            success: true,
            status: response.status,
            data: response.data,
            error: false,
            message: response.data ?.message || 'Հաջող է'
        };
    } catch (error) {
        if (error.response) {
            return {
                success: false,
                status: error.response.status,
                data: null,
                error: true,
                message: error.response.data?.message || 'Սերվերից սխալ է ստացվել'
            };
        }

        return {
            success: false,
            status: null,
            data: null,
            error: true,
            message: error.message || 'Ցանցի կամ անհայտ սխալ'
        };
    }
}

function handlerNotify(message, type, iconColor = "#1aff00") {
    return Swal
        .fire({
            position: "top-end",
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            background: "#1e1e1e",
            color: "#f0f0f0",
            iconColor
        });
}

function setFormLoading(form, isLoading = true) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = isLoading;
}

document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl)
    });
});

// setup Navigation Links
function setupNavLinks() {
    // This will find all navigation links
    const links = document.querySelectorAll('a[data-section]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // don't let it do a default redirect

            const sectionId = link.getAttribute('data-section');
            // If we are already on the main page
            if (window.location.pathname === '/' || window.location.pathname === '/') {
                const section = document.querySelector(`#${sectionId}`);
                if (section) section.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                // Otherwise redirect to the home page with anchor
                window.location.href = `/${sectionId ? '#' + sectionId : ''}`;
            }
        });
    });
}

// Password show, hide
function exposePass() {
    var x = document.getElementById("xPassword");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function capLock(e) {
    kc = e.keyCode ? e.keyCode : e.which;
    sk = e.shiftKey ? e.shiftKey : ((kc == 16) ? true : false);
    if (((kc >= 65 && kc <= 90) && !sk) || ((kc >= 97 && kc <= 122) && sk))
        document.getElementById('capsOn').style.visibility = 'visible';
    else
        document.getElementById('capsOn').style.visibility = 'hidden';
}


function initPasswordToggle() {
    let passwordFields = document.querySelectorAll('.input_field');

    passwordFields.forEach(field => {
        // գտնում ենք password input-ը
        let passwordInput = field.querySelector('input[type="password"]');

        if (passwordInput) {
            // ստեղծում ենք կոճակը
            let button = document.createElement('button');
            button.type = "button";
            button.classList.add('password-show');
            button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

            // click event
            button.addEventListener('click', function () {
                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                    button.innerHTML = `<i class="fa-solid fa-eye"></i>`;
                } else {
                    passwordInput.type = "password";
                    button.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`;
                }
            });
            field.appendChild(button);
        }
    });
}

function changeProfileImage() {
    let fileInput = document.querySelector("input[type=file]");
    if(fileInput) {
        fileInput.addEventListener("change", async function(e) {   
        let file = this.files[0];
        
        if (file) {
            // Preview image
            let preview = document.querySelector(".profile-img");
            let pSmImage = document.querySelector(".profime-sm-image");
            preview.src = URL.createObjectURL(file);
            pSmImage.src = URL.createObjectURL(file);
    
            let formData = new FormData();
            formData.append("user_img", file);
    
            try {
            const response = await doAxios('/api/v1/user/updateme', 'patch', formData);
            if(response.status === 400) {
                preview.src  = './client/images/no-image-profile.jpg'
                pSmImage.src = './client/images/no-image-profile.jpg'
            }
            } catch (err) {
            console.error("Upload failed:", err);
            }
        }
        });
    }
}

changeProfileImage();
initPasswordToggle();
setupNavLinks();

const accordionCollapseElementList = document.querySelectorAll('#headingThree .collapse')
const accordionCollapseList = [...accordionCollapseElementList].map(accordionCollapseEl => new bootstrap.Collapse(accordionCollapseEl))

    function getCookie(name) {
        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1];
    }
    const token = getCookie("jwt");
    console.log(token);