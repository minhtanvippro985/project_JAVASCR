let categoryBody = document.getElementById('categoryBody');
let categoryInput = document.getElementById('categoryInput');
let addBtn = document.getElementById('addBtn');
let searchInput = document.getElementById('searchInput');

let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let entries = JSON.parse(localStorage.getItem('entries')) || [];
let articles = JSON.parse(localStorage.getItem('articles')) || [];
let editId = null; 

let currentPage = 1;
const rowsPerPage = 5;
let filteredEntries = [...entries];

// if (currentUser) {
//     if (currentUser.role === "user") {
//         window.location.href = "/index.html";
//     }
// } else {
//     window.location.href = "/pagesHTML/login.html";
// }

function renderProfile() {
    if (!currentUser || currentUser.role === "user") {
        window.location.href = "./login.html";
        return;
    } 

    const avatarImg = document.getElementById('avatar');
    if (avatarImg) {
        avatarImg.src = currentUser.img || "/assets/imagers/user_PFP.png";
    }
}


function renderEntries() {
    categoryBody.innerHTML = '';
    
    const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedItems = filteredEntries.slice(startIndex, endIndex);

    paginatedItems.forEach((item, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${item.name}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editEntry(${item.id})">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteEntry(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        categoryBody.appendChild(row);
    });

    
    updatePaginationUI(totalPages);
}

function updatePaginationUI(totalPages) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (!paginationNumbers) return;
    paginationNumbers.innerHTML = '';

    // Tạo các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        let btn = document.createElement('button');
        btn.innerText = i;
        btn.className = (i === currentPage) ? "page-num active" : "page-num";
        btn.onclick = () => {
            currentPage = i;
            renderEntries();
        };
        paginationNumbers.appendChild(btn);
    }

    // Xử lý nút Previous/Next
    prevBtn.disabled = (currentPage === 1);
    nextBtn.disabled = (currentPage === totalPages || totalPages === 0);

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderEntries();
        }
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderEntries();
        }
    };
}

// Thêm / Sửa
addBtn.addEventListener('click', () => {
    let name = categoryInput.value.trim();
    if (!name) {
        alert("Vui lòng nhập tên danh mục!");
        return;
    }

    if (editId !== null) {
        let oldEntry = entries.find(item => item.id === editId);
        let oldName = oldEntry ? oldEntry.name : null;

        entries = entries.map(item => 
            item.id === editId ? { ...item, name: name } : item
        );

        if (oldName && oldName !== name) {
            articles = articles.map(article => 
                article.entries === oldName ? { ...article, entries: name } : article
            );
            localStorage.setItem('articles', JSON.stringify(articles));
        }
        editId = null;
        addBtn.innerText = "Add Category";
    } else {
        entries.push({ id: Date.now(), name: name });
    }

    filteredEntries = [...entries];
    saveAndRender();
    categoryInput.value = '';
});

// Xóa
window.deleteEntry = (id) => {
    let entryToDelete = entries.find(item => item.id === id);
    if (!entryToDelete) return;

    const isUsed = articles.some(article => article.entries === entryToDelete.name);
    if (isUsed) {
        alert(`Không thể xóa "${entryToDelete.name}" vì đang có bài viết sử dụng!`);
        return;
    }

    if (confirm(`Xóa danh mục "${entryToDelete.name}"?`)) {
        entries = entries.filter(item => item.id !== id);
        filteredEntries = [...entries];
        saveAndRender();
    }
};

window.editEntry = (id) => {
    let entryToEdit = entries.find(item => item.id === id);
    if (entryToEdit) {
        categoryInput.value = entryToEdit.name;
        editId = id;
        addBtn.innerText = "Update Category";
        categoryInput.focus();
    }
};

searchInput.addEventListener('input', (e) => {
    let keyword = e.target.value.toLowerCase();
    filteredEntries = entries.filter(item => 
        item.name.toLowerCase().includes(keyword)
    );
    currentPage = 1; 
    renderEntries();
});

function saveAndRender() {
    localStorage.setItem('entries', JSON.stringify(entries));
    renderEntries();
}
document.getElementById(`btnLogout`).addEventListener('click', () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem('currentUser');
    window.location.href = "/pagesHTML/login.html";
    }
});

renderEntries();
renderProfile();