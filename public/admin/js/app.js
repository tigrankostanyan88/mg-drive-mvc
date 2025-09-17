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

function checkImage() {
    let questionImageFile = document.querySelector('.questionImage');
    if (questionImageFile) {
        let img = questionImageFile.querySelector('img');
        let fileInput = questionImageFile.querySelector('input[type="file"]');
        img.src = 'https://www.legrand.com.vn/modules/custom/legrand_ecat/assets/img/no-image.png';
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

checkImage();

// ==== loading button disable ====
function setFormLoading(form, isLoading = true) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = isLoading;
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let hasEmptyField = false;

    inputs.forEach(input => {
        if (input.type === 'file') return;
        if (input.value.trim() === '') {
            handlerNotify("Բոլոր մուտքագրման դաշտերը պետք է լրացված լինեն", 'warning', '#ff9900');
            input.style.outline = '1px solid #fc0303';
            hasEmptyField = true;
        } else {
            input.style.outline = '';
        }
    });

    return !hasEmptyField;
}

async function handlerSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!validateForm(form)) return;

    const onlyInputs = form.querySelectorAll('input, textarea');
    const button = form.querySelector('button[type="submit"]');

    const formData = new FormData(form);
    const URL = form.getAttribute('action');
    const METHOD = form.getAttribute('method')?.toLowerCase();

    button.disabled = true;
    setFormLoading(form, true);

    try {
        let dataToSend;
        if (METHOD === 'patch' || METHOD === 'post') {
            const options = formData.getAll('answer');
            if (options.length > 0) {
                formData.delete('answer');
                formData.append('options', JSON.stringify(options));
            }
            dataToSend = formData;
        } else {
            dataToSend = Object.fromEntries(formData.entries());
        }

        const config = await doAxios(URL, METHOD, dataToSend);

        if (METHOD !== 'patch' || METHOD === 'delete') {
            button.disabled = true;
        }

        button.disabled = false;
        checkImage();

        if (config.error || config.status >= 400) {
            handlerNotify(config.message || 'Խնդրում ենք կրկին փորձել', 'error', '#ff9900');
        } else if (config.status == 201 || config.status == 200) {
            onlyInputs.forEach(el => el.value = '');
            handlerNotify('Հաջողությամբ ստացվեց', 'success', "#1aff00");

            checkImage();
            renderTest?.();
            renderGroup?.();

            if (config.data.redirect) {
                if (config.data.redirect !== 'reload') {
                    setTimeout(() => {
                        window.location.href = config.data.redirect;
                    }, 1300);
                } else {
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 500);
                }
            }
        }
    } catch (error) {
        handlerNotify(error.message || 'Ցանցի սխալ', 'error');
        checkImage();
    } finally {
        setFormLoading(form, false);
        button.disabled = false;
    }
}

Array.from(document.querySelectorAll('form')).forEach(form => {
    // submit event
    form.addEventListener('submit', handlerSubmit);
});

const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl)
});

document.querySelectorAll('.number').forEach(inp=>{
  inp.addEventListener('input',()=>{
    inp.value = inp.value.replace(/\D+/g,''); // թողնում ա միայն թվերը
  });
});