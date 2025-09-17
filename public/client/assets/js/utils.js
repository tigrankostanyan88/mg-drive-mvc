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

async function doAxios(url, method = "GET", data = null) {
    try {
        const config = {
            method,
            url
        };

        if (method.toUpperCase() === "GET") config.params = data;
        else config.data = data;

        const response = await axios(config);
        return response.data;
    } catch (error) {
        // console.error("Error in Axios request:", error);
        throw error;
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


const accordionCollapseElementList = document.querySelectorAll('#headingThree .collapse')
const accordionCollapseList = [...accordionCollapseElementList].map(accordionCollapseEl => new bootstrap.Collapse(accordionCollapseEl))