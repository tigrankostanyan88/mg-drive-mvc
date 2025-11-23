// Helpers
const qs = (sel) => document.querySelector(sel);

const StatusClass = {
    "Ակտիվ": "bg-success",
    "Անջատված": "bg-secondary",
    "Սևագիր": "bg-warning text-dark"
};

// API Loader
async function loadTests() {
    try {
        const res = await axios.get("/api/v1/tests");
        return res.data.tests || [];
    } catch (err) {
        console.error("Failed to load tests:", err);
        return [];
    }
}

function formatDate(date) {
    const d = new Date(date);

    return (
        d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0") + " " +
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0")
    );
}

// Rendering
function renderSummary(list) {
    qs('#totalTestsCount').textContent    = list.length;
}

function renderTable(list) {
    const tbody = qs('#testsTable tbody');

    if (!list.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    Ոչ մի թեստ չի գտնվել
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.title}-${t.number}</td>
            <td>${t.questions.length}</td>
            <td>${formatDate(t.updatedAt)}</td>
            <td>
                <div class="action-icons">
                    <a href="#" title="Դիտել"><i class="bi bi-eye"></i></a>
                    <a href="#" title="Խմբագրել"><i class="bi bi-pencil"></i></a>
                    <a href="#" title="Ջնջել"><i class="bi bi-trash"></i></a>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderAll(list) {
    renderSummary(list);
    renderTable(list);
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
    const container = qs("#tests");
    if (!container) return;

    const tests = await loadTests();

    console.log(tests)
    renderAll(tests);

    new SearchEngine({
        inputSelector: "#searchTest",
        data: tests,
        fields: ["name", "group", "status"],
        onResult: (filtered) => renderAll(filtered)
    });
});
