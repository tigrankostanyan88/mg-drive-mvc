const GroupStatusClass = {
    "Ակտիվ": "bg-success",
    "Ընթանում է": "bg-primary",
    "Ավարտված": "bg-secondary"
};

function renderGroupSummary(list) {
    qs('#totalGroupsCount').textContent    = list.length;
    qs('#activeGroupsCount').textContent   = list.filter(g => g.status === "Ակտիվ" || g.status === "Ընթանում է").length;
    qs('#completedGroupsCount').textContent = list.filter(g => g.status === "Ավարտված").length;
}

function renderGroupTable(list) {
    const tbody = qs('#groupsTable tbody');
    if (!tbody) return;

    if (!list.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    Ոչ մի խումբ չի գտնվել
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(g => `
        <tr>
            <td>${g.name}</td>
            <td>${g.instructor}</td>
            <td>${g.students}/${g.maxStudents}</td>
            <td>${g.startDate}</td>
            <td>${g.endDate}</td>
            <td><span class="badge ${GroupStatusClass[g.status] || "bg-secondary"}">${g.status}</span></td>
            <td>
                <div class="action-icons">
                    <a href="#" title="Դիտել"><i class="bi bi-eye"></i></a>
                    <a href="#" title="Խմբագրել"><i class="bi bi-pencil"></i></a>
                    <a href="#" title="Ջնջել"><i class="bi bi-trash"></i></a>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderGroups(list = groups) {
    renderGroupSummary(list);
    renderGroupTable(list);
}

document.addEventListener("DOMContentLoaded", () => {
    const groupsSection = document.getElementById('groups');
    if(!groupsSection) return
    
    // Initial render
    renderGroups(groups);

    // Universal search integration
    new SearchEngine({
        inputSelector: "#searchInput",
        data: groups,
        fields: ["name", "instructor", "status"],
        onResult: (filtered) => renderGroups(filtered)
    });
});