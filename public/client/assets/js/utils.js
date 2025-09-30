(function accordion() {
    const accordions = document.querySelectorAll('.my-accordion');

    accordions.forEach(item => {
        const button = item.querySelector('button');
        const descr = item.querySelector('.descr');
        const icon = item.querySelector('.icon');

        item.addEventListener('click', () => {
            const isOpen = descr.style.height !== '0px';

            accordions.forEach(acc => {
                acc.querySelector('.descr').style.height = '0px';
                acc.querySelector('button').classList.remove('active');
                acc.querySelector('.icon').innerHTML = '<i class="fa-solid fa-plus"></i>';
            });

            if (!isOpen) {
                descr.style.height = descr.scrollHeight + 'px';
                button.classList.add('active');
                icon.innerHTML = '<i class="fa-solid fa-minus"></i>';
            }
        });
    });
})();

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
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return {
            success: true,
            status: response.status,
            data: response.data,
            error: false,
            message: response.data?.message || 'Հաջող է'
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
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Otherwise redirect to the home page with anchor
            window.location.href = `/${sectionId ? '#' + sectionId : ''}`;
        }
        });
    });
}

document.addEventListener('DOMContentLoaded', setupNavLinks);
const accordionCollapseElementList = document.querySelectorAll('#headingThree .collapse')
const accordionCollapseList = [...accordionCollapseElementList].map(accordionCollapseEl => new bootstrap.Collapse(accordionCollapseEl))