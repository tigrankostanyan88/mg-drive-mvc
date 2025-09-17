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


function timeSince(dateString) {
    const inputDate = new Date(dateString);
    const now = new Date();

    const diffMs = now - inputDate;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const years = now.getFullYear() - inputDate.getFullYear();
    const months = (now.getFullYear() - inputDate.getFullYear()) * 12 + (now.getMonth() - inputDate.getMonth());

    if (years >= 1) {
        return `Տարեթիվը հին է։ Մուտքագրված ամսաթիվն է՝ ${inputDate.toLocaleDateString()}`;
    } else if (months >= 1) {
        return `Անցել է ${months} ամիս`;
    } else if (diffDays >= 1) {
        return `Անցել է ${diffDays} օր`;
    } else if (diffHours >= 1) {
        return `Անցել է ${diffHours} ժամ`;
    } else {
        return `Անցել է ${diffMinutes} րոպե`;
    }
}

function getDate(dateStrISO, type = 'full') {
    const date = new Date(dateStrISO);

    // Create a formatter for 'day.month.year' format
    const dateFormat = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    // Create a formatter for 'hours:minutes:seconds' format
    const timeFormat = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    if (type === 'full' || type === 'date') {
        return dateFormat.format(date);
    } else if (type === 'hours') {
        return timeFormat.format(date);
    }

    // Default case if type doesn't match
    return ''; 
}


function resetAllAriaHiddenControls() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        const modalObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (
                    mutation.attributeName === 'aria-hidden' &&
                    modal.getAttribute('aria-hidden') === 'true'
                ) {
                    modal.setAttribute('aria-hidden', 'false');
                }
            });
        });

        modalObserver.observe(modal, { attributes: true });
    });

    // ✅ Blur focus when submitting forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        });
    });

    const globalObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (
                mutation.attributeName === 'aria-hidden' &&
                mutation.target.getAttribute('aria-hidden') === 'true'
            ) {
                mutation.target.setAttribute('aria-hidden', 'false');
            }
        });
    });

    globalObserver.observe(document.body, {
        attributes: true,
        subtree: true, 
        attributeFilter: ['aria-hidden']
    });
}

resetAllAriaHiddenControls()