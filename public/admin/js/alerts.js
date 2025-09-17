class HandlerSubmit {
    constructor(api, message) {
        this.api = api;
        this.message = message;
        this.addForm();
    }

    async addForm() {
        const { value, isConfirmed } = await Swal.fire({
            title: "Ավելացնել նոր " + this.message,
            input: 'text',
            inputPlaceholder: `Օրինակ՝ ${this.message}-3`,
            inputAttributes: {
                autocapitalize: "off",
                required: true
            },
            customClass: {
                popup: 'dark-theme'
            },
            showCancelButton: true,
            confirmButtonText: "ՈՒղարկել",
            showLoaderOnConfirm: true,
            preConfirm: async (inputValue) => {
                try {
                    const response = await fetch(`${this.api}${inputValue}`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Սխալ տեղի ունեցավ');
                    }
                    return response.json();
                } catch (error) {
                    Swal.showValidationMessage(`Սխալ: ${error.message}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (isConfirmed && value) {
            Swal.fire({
                title: `${value.login}'s avatar`,
                imageUrl: value.avatar_url
            });
        }
    }
}
