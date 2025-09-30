const faqs = document.querySelectorAll('.faq');
const backToTop = document.getElementById('backToTop');
const progress = document.getElementById('progress');
const navProgress = document.querySelector('.nav_progress');
const questionsEl = document.querySelectorAll('.faq-question');

function handleNavbar() {
    let nav = document.querySelector('nav');
    let navbar = document.querySelector('.navbar');
    let body = document.querySelector('body');

    function toggleNavbar() {
        body.style.overflow = navbar.classList.contains('active') ? 'hidden' : 'auto';
    }

    document.addEventListener('click', (e) => {
        let button = e.target.closest('.open_menu, .close_menu');
        

        if (!button) return;

        if (button.classList.contains('open_menu')) {
            navbar.classList.add('active');
            body.style.overflow = 'hidden';
        } else if (button.classList.contains('close_menu')) {
            navbar.classList.remove('active');
            body.style.overflow = 'Auto';
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth < 360 || window.innerWidth > 992) {
            navbar.style.transition = 'none';
            navbar.classList.remove('active');
            toggleNavbar();
        } else {
            navbar.style.transition = 'all .5s ease-in-out';
        }
    });

    let navLinks = document.querySelectorAll('.nav_link');

    navLinks.forEach(link => {
        link.addEventListener('click', () => navbar.classList.remove('active'));
    });

    document.querySelector('body').addEventListener('click', () => {
        navbar.classList.remove('active');
        toggleNavbar();
    });

    window.addEventListener('scroll', () => {
        // Check the vertical scroll position
        if (window.scrollY > 700) {
            nav.classList.add('sticky');
        } else {
            nav.classList.remove('sticky');
        }
    });
}

function inputField() {
    let inputField = document.querySelectorAll('.input_field');

    inputField.forEach(element => {
        const input = element.querySelector('input');
        const span = element.querySelector('span');
        handleInputChange(input, span)

        // Add an event listener for user input
        input.addEventListener('input', () => handleInputChange(input, span));
    });

    function handleInputChange(input, span) {
        const hasValue = input.value.trim() !== '';
        if (input !== null && span !== null) hasValue ? span.classList.add('active') : span.classList.remove('active')
    }
}


if (progress) {
    window.addEventListener('scroll', () => {
        // Back to Top visibility
        if (window.scrollY > 700) backToTop.classList.add('active');
        else backToTop.classList.remove('active');

        // Scroll progress
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        if (Math.round(scrollPercent) > 60) {
            backToTop.style.color = '#fff';
        } else {
            backToTop.style.color = 'var(--primary-color)';
        }


        progress.style.width = scrollPercent + "%";
        if (navProgress) navProgress.style.width = scrollPercent + "%";
    });
}

if(backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

// let questions = document.querySelectorAll('#lightgallery');
// if(questions) {
//     questions.forEach(question => {
//         if (question) {
//             lightGallery(question, {
//                 licenseKey: 'your_license_key',
//                 speed: 500,
//                 download: false
//             });
//         }
//     });
// }

// account profile check gender fields
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('gender')) {

        const input = e.target.closest('input');
        document.querySelectorAll('label').forEach(el => el.style.border = '1px solid #ddd')

        e.target.closest('label').style.border = '1px solid #ccc';
        setTimeout(() => {
            if (input.checked) {
                e.target.closest('label').style.border = '1px solid #444cf7';
            } else {
                e.target.closest('label').style.border = '1px solid #ccc';
            }
        }, 10);
    }
});

// ❌ Prohibit right-click/save image
document.addEventListener('contextmenu', event => event.preventDefault());

handleNavbar();
inputField();


Array.from(document.querySelectorAll('form')).forEach(form => {
  form.addEventListener('submit', async(e) => {
    e.preventDefault();

    if (!validateBootstrap(form)) {
      handlerNotify("Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը", 'warning', '#ff9900');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const URL = form.getAttribute('action');
    const METHOD = form.getAttribute('method')?.toLowerCase();

    button.disabled = true;
    setFormLoading(form, true);

    try {
      let dataToSend = formData;
      if (METHOD !== 'patch' && METHOD !== 'post') {
        dataToSend = Object.fromEntries(formData.entries());
      }

      const response = await doAxios(URL, METHOD, dataToSend);

      if (response.error || response.status >= 400) {
        handlerNotify(response.message || 'Խնդրում ենք կրկին փորձել', 'error', '#ff9900');
      } else {
        handlerNotify('Հաջող մուտք', 'success', "#1aff00");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      handlerNotify(error.response.data.message || 'Ցանցի սխալ', 'warning', "#CC484C");
    } finally {
      setFormLoading(form, false);
      button.disabled = false;
    }
  });
});
