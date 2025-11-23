// Utils JavaScript - Universal utilities for the admin panel
document.addEventListener('DOMContentLoaded', function () {
    function initializeUniversalFeatures() {
        // Initialize file cropping for elements with file-crop class
        initializeFileCropping();

        // Initialize other universal features here
    }
    initializeUniversalFeatures();
    let cropper = null;
    let currentImagePreview = null;
    let currentCropperPage = null;
    function initializeFileCropping() {
        // Find all file inputs with file-crop class
        const fileCropInputs = document.querySelectorAll('input[type="file"].file-crop');

        fileCropInputs.forEach(input => {
            const uploadBtn = input.closest('.image-upload').querySelector('button');
            const previewElement = input.closest('.image-upload').querySelector('img');

            if (uploadBtn && previewElement) {
                uploadBtn.addEventListener('click', () => input.click());
                input.addEventListener('change', (e) => handleImageUploadWithCrop(e, previewElement));
            }
        });

        // Initialize crop modal if it exists
        initializeCropModal();
    }
    function handleImageUploadWithCrop(event, previewElement) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                currentImagePreview = previewElement;
                // Determine page context for aspect ratio
                const pathname = window.location.pathname;
                const isSections = pathname.includes('sections.html') || pathname.includes('sections');
                const isCatalogs = pathname.includes('catalogs.html') || pathname.includes('catalogs');
                const isProducts = pathname.includes('products.html') || pathname.includes('products');
                currentCropperPage = isSections ? 'sections' : isCatalogs ? 'catalogs' : isProducts ? 'products' : null;
                // console.log('Page detected:', currentCropperPage, 'Pathname:', pathname); // Debug log
                openCropModal(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
    function openCropModal(imageSrc) {
        const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
        const cropImage = document.getElementById('cropImage');

        if (!cropModal || !cropImage) {
            // console.warn('Crop modal not found. Make sure cropModal exists in the HTML.');
            return;
        }

        cropImage.src = imageSrc;
        cropModal.show();

        // Initialize cropper after modal is shown
        setTimeout(() => {
            let aspectRatio;
            // console.log('Initializing cropper for page:', currentCropperPage); // Debug log
            if (currentCropperPage === 'catalogs' || currentCropperPage === 'products') {
                aspectRatio = 1; // Square for catalogs and products
            } else {
                aspectRatio = NaN; // Free aspect ratio for sections
            }
            // console.log('Aspect ratio set to:', aspectRatio); // Debug log

            cropper = new Cropper(cropImage, {
                aspectRatio: aspectRatio,
                viewMode: 1,
                responsive: true,
                restore: false,
                checkCrossOrigin: false,
                checkOrientation: false,
                modal: true,
                guides: true,
                center: true,
                highlight: true,
                background: false,
                autoCrop: true,
                autoCropArea: 0.8
            });
        }, 500);
    }
    function initializeCropModal() {
        const cropSaveBtn = document.getElementById('cropSaveBtn');
        if (cropSaveBtn) {
            cropSaveBtn.addEventListener('click', function () {
                console.log('Save crop button clicked'); 
                if (cropper) {
                    const originalImage = document.getElementById('cropImage');
                    const canvas = cropper.getCroppedCanvas({
                        width: originalImage.naturalWidth,
                        height: originalImage.naturalHeight,
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high'
                    });

                    canvas.toBlob(function (blob) {
                        const croppedImageUrl = URL.createObjectURL(blob);
                        if (currentImagePreview) {
                            currentImagePreview.src = croppedImageUrl;
                        }

                        // Close modal
                        const cropModal = bootstrap.Modal.getInstance(document.getElementById('cropModal'));
                        cropModal.hide();

                        // Destroy cropper
                        cropper.destroy();
                        cropper = null;
                    }, 'image/jpeg', 0.9);
                } else {
                    console.error('No cropper instance found'); // Debug log
                }
            });
        }

        // Reset cropper when modal is hidden
        const cropModalElement = document.getElementById('cropModal');
        if (cropModalElement) {
            cropModalElement.addEventListener('hidden.bs.modal', function () {
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
            });
        }
    }
    async function doAxios(url, method = 'GET', data = {}) {
        const isForm = data instanceof FormData;
        try {
            const response = await axios({
                url,
                method,
                data,
                headers: isForm ? {} : {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return {
                success: true,
                status: response.status,
                data: response.data,
                error: false,
                message: response.data?.message || 'OK'
            };

        } catch (error) {
            return {
                success: false,
                status: error.response?.status || null,
                data: null,
                error: true,
                message: error.response?.data?.message || 'Error'
            };
        }
    }
    function setFormLoading(form, isLoading = true) {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.disabled = isLoading;
    }
    function validateForm(form) {
        const inputs = form.querySelectorAll('input, select[name="row_id"]');
        let hasEmptyField = false;
        let notified = false;

        inputs.forEach(input => {
            if (input.type === 'file' && input.value === '') return;

            if (input.value.trim() === '') {
                if (!notified) {
                    console.log(input)
                    showNotification(`<b class="text-danger">«${input.getAttribute('placeholder') || "բոլոր "}»</b> մուտքագրման դաշտը պետք է լրացվի.`, 'warning');
                    notified = true;
                }
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
        const button = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea');

        if (!validateForm(form)) return;

        // Prepare data object
        const dataToSend = {};

        // Extract simple inputs automatically
        const formData = new FormData(form);
        formData.forEach((value, key) => {
            dataToSend[key] = value;
        });
        
        // document.querySelectorAll('select[name="row_id"]').forEach(el => {
        //     console.log(el);
        // })

        // Extract options[] explicitly
        const optionInputs = form.querySelectorAll('[name="answer_item"]');
        let optionsToJson = Array.from(optionInputs)
            .map(i => i.value.trim())
            .filter(Boolean);
        dataToSend.options = JSON.stringify(optionsToJson)

        const URL = form.getAttribute('action');
        const METHOD = form.getAttribute('method')?.toLowerCase();

        if (URL.includes('logout')) {
            window.location.href = '/';
            return;
        }

        // Delete confirmation
        if (METHOD === 'delete' && !confirm("Վստա՞հ եք, որ ուզում եք ջնջել։")) {
            return;
        }

        button.disabled = true;
        setFormLoading(form, true);

        try {
            const config = await doAxios(URL, METHOD, dataToSend);

            if (!config || config.status >= 400 || config.error) {
                showNotification(config?.message || 'Խնդիր առաջացավ, խնդրում ենք կրկին փորձել։', 'error');
            } else {

                // Reset logic
                if (METHOD === 'post') {
                    form.querySelectorAll('.validate').forEach(i => (i.value = ''));
                    form.querySelectorAll('.editor-area').forEach(e => (e.innerHTML = ''));
                }

                if (METHOD !== 'post' && METHOD !== 'patch') {
                    inputs.forEach(el => (el.value = ''));
                }
                showNotification("Հաջողությամբ ստացվել է", 'success');
                 setTimeout(() => {
                    window.location.reload(true);
                }, 800);
            }

        } catch (error) {
            showNotification(error?.message || 'Server error', 'error');

        } finally {
            setFormLoading(form, false);
            button.disabled = false;
        }   
    }
    function formatDate(iso) {
        const d = new Date(iso);

        return (
            d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0") + " " +
            String(d.getHours()).padStart(2, "0") + ":" +
            String(d.getMinutes()).padStart(2, "0")
        );
    }
    Array.from(document.querySelectorAll('form')).forEach(form => {
        // submit event
        form.addEventListener('submit', handlerSubmit);
    });
    function trima() {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(el => {
            el.value = el.value.trim();
        });
    }
    trima();
});