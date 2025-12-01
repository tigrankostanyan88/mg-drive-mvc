// Data from server
const users = Array.isArray(window.__USERS__) ? window.__USERS__ : [];

function mapRoleToHy(role) {
    switch (role) {
        case 'student': return 'Ուսանող';
        case 'teacher': return 'Ինստրուկտոր';
        case 'admin': return 'Ադմին';
        case 'team-member': return 'Թիմի անդամ';
        default: return 'Օգտվող';
    }
}

// Get role badge class
function getRoleBadgeClass(role) {
    if (role === 'Ուսանող') return 'bg-primary';
    if (role === 'Ինստրուկտոր') return 'bg-warning text-dark';
    if (role === 'Ադմին') return 'bg-danger';
    return 'bg-secondary';
}

// Render users table
function renderUsers(filteredUsers = users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Օգտվողներ չեն գտնվել</td></tr>';
        return;
    }

    filteredUsers.forEach(user => {
        const roleHy = mapRoleToHy(user.role);
        const roleBadge = getRoleBadgeClass(roleHy);
        const file = (user.files || []).find(f => f.name_used === 'user_img');
        const avatar = file ? `/images/users/large/${file.name}.${file.ext}` : '';
        const initials = (user.name || '').split(' ').map(p => p[0]).slice(0,2).join('');
        const created = user.createdAt || user.date;
        const row = `
            <tr>
                <td>
                    <div class="user-name-cell">
                        <img src="${avatar}" alt="${user.name}" class="user-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="user-avatar-placeholder" style="display: none;">${initials}</div>
                        <span>${user.name}</span>
                    </div>
                </td>
                <td><span class="badge ${roleBadge}">${roleHy}</span></td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>${user.address || ''}</td>
                <td>${created ? new Date(created).toLocaleDateString('hy-AM') : ''}</td>
                <td><span class="badge ${user.statusBadge}">${user.status}</span></td>
                <td>
                    <div class="action-icons">
                        <a href="#" class="edit-user-btn" data-user-id="${user.id}" title="Խմբագրել"><i class="bi bi-pencil"></i></a>
                        <a href="#" title="Արգելափակել"><i class="bi bi-lock"></i></a>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = parseInt(this.getAttribute('data-user-id'));
            openEditUserRoleModal(userId);
        });
    });
}

// Open edit user role modal
function openEditUserRoleModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('Օգտվողը չի գտնվել');
        return;
    }

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    const roleSelect = document.getElementById('editUserRole');
    const roleWrapper = roleSelect ? roleSelect.closest('.mb-3') : null;
    if (roleSelect) roleSelect.value = user.role;

    if (user.role === 'Ադմին') {
        if (roleWrapper) roleWrapper.style.display = 'none';
    } else {
        if (roleWrapper) roleWrapper.style.display = '';
    }

    const modal = new bootstrap.Modal(document.getElementById('editUserRoleModal'));
    modal.show();
}

// Save user role
function saveUserRole() {
    const userId = parseInt(document.getElementById('editUserId').value);
    const newRole = document.getElementById('editUserRole').value;

    if (!userId || !newRole) {
        alert('Խնդրում ենք լրացնել բոլոր դաշտերը');
        return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('Օգտվողը չի գտնվել');
        return;
    }

    if (user.role === 'Ադմին') {
        alert('Ադմին օգտվողի կարգավիճակը չի կարելի փոխել');
        return;
    }

    // Update user role
    user.role = newRole;
    user.roleBadge = getRoleBadgeClass(newRole);

    // Re-render users table
    filterUsers();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserRoleModal'));
    modal.hide();

    // Show success message
    console.log('Օգտվողի կարգավիճակը թարմացվել է');
}

// Update URL with current filter values
function updateURL() {
    const sEl = document.getElementById('searchInput');
    const fEl = document.getElementById('filterStatus');

    if (!sEl || !fEl) return; // ← ԱՅՍԸ ԱՓՐՈՒՄ Է ՔՈ ԷՋԸ

    const searchTerm  = sEl.value;
    const statusFilter = fEl.value;

    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter) params.set('status', statusFilter);

    const newURL = params.toString() 
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

    window.history.pushState({}, '', newURL);
}


// Load filters from URL
function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    const searchTerm = params.get('search');
    const statusFilter = params.get('status');

    if (searchTerm) {
        document.getElementById('searchInput').value = searchTerm;
    }
    if (statusFilter) {
        document.getElementById('filterStatus').value = statusFilter;
    }
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    let filtered = users;

    // Filter by status
    if (statusFilter) {
        filtered = filtered.filter(u => u.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.name.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm) ||
            u.phone.includes(searchTerm) ||
            u.city.toLowerCase().includes(searchTerm) ||
            u.role.toLowerCase().includes(searchTerm)
        );
    }

    renderUsers(filtered);
    updateURL();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const usersSection = document.getElementById('users');
    if(!usersSection) return;
    // Load filters from URL
    loadFiltersFromURL();
    
    // Apply filters and render
    filterUsers();

    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('filterStatus').addEventListener('change', filterUsers);
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        loadFiltersFromURL();
        filterUsers();
    });
});

// Export for API integration
usersData = {
    users: users,
    updateData: function(newUsers) {
        users.length = 0;
        users.push(...newUsers);
        filterUsers();
    }
};
