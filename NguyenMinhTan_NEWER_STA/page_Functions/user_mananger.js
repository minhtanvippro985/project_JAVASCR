let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let isAscending = true; 
let currentDisplayUsers = []; 

let currentPage = 1;
const rowsPerPage = 1; 

if (currentUser) {
    if (currentUser.role === "user") {
        window.location.href = "/index.html";
    }
} else {
    window.location.href = "/pagesHTML/login.html";
}

function renderProfile() {
    if (currentUser) {
        const avatarImg = document.getElementById('avatar'); 
        if (avatarImg) {
           
            avatarImg.src = currentUser.avatar || "/assets/imagers/user_PFP.png";
        }
    }
}

function renderUsers(usersToRender = null) {
    const tableBody = document.getElementById('tableBody');
    const userCountSpan = document.getElementById('userCount');
    
    // ADMIN HIDERS
    let rawUsers = usersToRender || JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = rawUsers.filter(user => {
        const userRole = user.role ? user.role.toLowerCase() : '';
        const isSelf = currentUser && user.id === currentUser.id;
        return userRole !== 'admin' && !isSelf;
    });
 

    currentDisplayUsers = filteredUsers;

    if (userCountSpan) {
        userCountSpan.innerText = `${filteredUsers.length} users`;
    }

    if (!tableBody) return;

    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    tableBody.innerHTML = "";
    if (paginatedUsers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">No users found</td></tr>`;
    } else {
        paginatedUsers.forEach((user) => {
            const isInactive = user.status === 'inactive';
            const statusClass = isInactive ? 'status-inactive' : 'status-active';
            
            tableBody.innerHTML += `
                <tr id="userRow-${user.id}">
                    <td>
                        <div class="user" id="userInfo-${user.id}">
                            <img src="${user.avatar || '/assets/imagers/user_PFP.png'}" id="userImg-${user.id}">
                            <div>
                                <p id="userName-${user.id}" style="font-weight:bold">${user.firstname} ${user.lastname}</p>
                                <span id="userUsername-${user.id}">${user.email.toLowerCase()}</span>
                            </div>
                        </div>
                    </td>
                    <td id="userStatus-${user.id}"><span class="${statusClass}">${user.status || 'hoạt động'}</span></td>
                    <td id="userEmail-${user.id}">${user.email}</td>
                    <td id="userAction-${user.id}">
                        <button class="block" onclick="handleBlock(${user.id})" ${isInactive ? 'disabled style="opacity: 0.5;"' : ''}>block</button>
                        <button class="unblock" onclick="handleUnblock(${user.id})" ${!isInactive ? 'disabled style="opacity: 0.5;"' : ''}>unblock</button>
                    </td>
                </tr>
            `;
        });
    }

    renderPagination(totalPages);
}
// PAGE FUNC
function renderPagination(totalPages) {
    const pagesContainer = document.getElementById('pages');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!pagesContainer) return;

    pagesContainer.innerHTML = "";

    if (totalPages <= 1) {
        document.getElementById('pagination').style.display = "none";
        return;
    }
    document.getElementById('pagination').style.display = "flex";

    for (let i = 1; i <= totalPages; i++) {
        const span = document.createElement('span');
        span.innerText = i;
        span.className = (i === currentPage) ? "active" : "";
        span.style.cursor = "pointer";
        span.onclick = () => {
            currentPage = i;
            renderUsers(currentDisplayUsers);
        };
        pagesContainer.appendChild(span);
    }

    prevBtn.disabled = (currentPage === 1);
    nextBtn.disabled = (currentPage === totalPages);

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderUsers(currentDisplayUsers);
        }
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderUsers(currentDisplayUsers);
        }
    };
}

window.handleBlock = function(userId) { updateUserStatus(userId, 'inactive'); }
window.handleUnblock = function(userId) { updateUserStatus(userId, 'hoạt động'); }
// STATUS FUNC
function updateUserStatus(userId, newStatus) {
    let allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const dbIndex = allUsers.findIndex(u => u.id === userId);
    if (dbIndex !== -1) {
        allUsers[dbIndex].status = newStatus;
        localStorage.setItem('users', JSON.stringify(allUsers));
        renderUsers(); 
    }
}
// SORT FUNC
function setupSort() {
    const sortIcon = document.getElementById('sortNameIcon');
    if (!sortIcon) return;
    sortIcon.addEventListener('click', () => {
        currentDisplayUsers.sort((a, b) => {
            const nameA = (a.firstname + a.lastname).toLowerCase();
            const nameB = (b.firstname + b.lastname).toLowerCase();
            return isAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        isAscending = !isAscending;
        sortIcon.className = isAscending ? "fa-solid fa-sort-alpha-down" : "fa-solid fa-sort-alpha-up";
        currentPage = 1; 
        renderUsers(currentDisplayUsers);
    });
}
// SEARCH
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        let allUsersFromDB = JSON.parse(localStorage.getItem('users')) || [];
        const filtered = allUsersFromDB.filter(user => 
            `${user.firstname} ${user.lastname}`.toLowerCase().includes(keyword) || 
            user.email.toLowerCase().includes(keyword)
        );
        currentPage = 1; // Reset về trang 1 khi search
        renderUsers(filtered);
    });
}
document.getElementById('btnLogout').addEventListener('click', () => {
    if(confirm("Đăng xuất?")) {
        localStorage.removeItem('currentUser');
        window.location.href = "/pagesHTML/login.html";
    }
});
document.addEventListener('DOMContentLoaded', () => {
    renderUsers();
    renderProfile();
    setupSort();
    setupSearch();
});