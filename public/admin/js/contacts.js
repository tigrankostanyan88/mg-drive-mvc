const defaultData = {
    phone: "+374 91 123456",
    email: "info@mg-drive.am",
    address: "Արթիկ, Հայաստան",
    googleMaps: "https://maps.google.com/?q=Artik,Armenia",
    workingHours: {
        monday: "09:00 - 18:00",
        tuesday: "09:00 - 18:00",
        wednesday: "09:00 - 18:00",
        thursday: "09:00 - 18:00",
        friday: "09:00 - 18:00",
        saturday: "09:00 - 14:00",
        sunday: "Դուրս"
    },
    social: {
        facebook: "",
        instagram: "",
        youtube: ""
    },
    additionalInfo: ""
};

let contactData = { ...defaultData };

function safeLoad() {
    try {
        const saved = JSON.parse(localStorage.getItem("mgDriveContacts"));
        if (saved) contactData = { ...contactData, ...saved };
    } catch {
        console.warn("Corrupted storage, using defaults");
    }
}

function syncFormToData() {
    const form = document.getElementById("contactsForm");

    contactData = {
        ...contactData,
        phone: form.phone.value,
        email: form.email.value,
        address: form.address.value,
        googleMaps: form.googleMaps.value,
        additionalInfo: form.additionalInfo.value,
        workingHours: {
            monday: form.monday.value,
            tuesday: form.tuesday.value,
            wednesday: form.wednesday.value,
            thursday: form.thursday.value,
            friday: form.friday.value,
            saturday: form.saturday.value,
            sunday: form.sunday.value
        },
        social: {
            facebook: form.facebook.value,
            instagram: form.instagram.value,
            youtube: form.youtube.value
        }
    };
}

function syncDataToForm() {
    const form = document.getElementById("contactsForm");

    for (let key in contactData) {
        if (typeof contactData[key] === "object") continue;
        if (form[key]) form[key].value = contactData[key];
    }

    Object.entries(contactData.workingHours).forEach(([k, v]) => {
        form[k].value = v;
    });

    Object.entries(contactData.social).forEach(([k, v]) => {
        form[k].value = v;
    });
}

function updatePreview() {
    document.getElementById("previewPhone").textContent = contactData.phone;
    document.getElementById("previewEmail").textContent = contactData.email;
    document.getElementById("previewAddress").textContent = contactData.address;
    document.getElementById("previewWeekdays").textContent = contactData.workingHours.monday;
    document.getElementById("previewSaturday").textContent = contactData.workingHours.saturday;
    document.getElementById("previewSunday").textContent = contactData.workingHours.sunday;

    const link = document.getElementById("previewMapsLink");
    const block = document.getElementById("previewMaps");

    if (contactData.googleMaps) {
        link.href = contactData.googleMaps;
        block.style.display = "flex";
    } else {
        block.style.display = "none";
    }
}

function saveContactData() {
    syncFormToData();
    localStorage.setItem("mgDriveContacts", JSON.stringify(contactData));
    updatePreview();
    showSuccessMessage("Պահպանվեց հաջողությամբ");
}

document.addEventListener("DOMContentLoaded", () => {
    const contactSection = document.getElementById('contacts');
    if(!contactSection) return
    safeLoad(); 
    syncDataToForm();
    updatePreview();

    document.querySelectorAll("#contactsForm input, #contactsForm textarea").forEach(el => {
        el.addEventListener("input", () => {
            syncFormToData();
            updatePreview();
        });
    });

    document.getElementById("saveContactsBtn").addEventListener("click", saveContactData);
});
