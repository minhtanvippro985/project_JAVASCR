let listArticles = JSON.parse(localStorage.getItem('articles')) || [];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));


let currentPage = 1;
const rowsPerPage = 5; // Số bài viết mỗi trang

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

function renderArticles() {
    if (!currentUser) {
        window.location.href = "./login.html";
        return;
    }

    const tableBody = document.querySelector('.article-table tbody');
    if (!tableBody) return;

    const totalPages = Math.ceil(listArticles.length / rowsPerPage);
    
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArticles = listArticles.slice(startIndex, endIndex);

    let html = "";

    if (paginatedArticles.length === 0) {
        html = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Không có bài viết nào.</td></tr>`;
    } else {
        paginatedArticles.forEach((article) => {
            const displayImage = article.image ? article.image : `https://picsum.photos/300/200?random=${article.id}`;
            const statusClass = article.status.toLowerCase() === "public" ? "public" : "private";

            html += `
                <tr>
                    <td>
                        <img src="${displayImage}" 
                             alt="article-img" 
                             style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;">
                    </td>
                    <td>${article.title}</td>
                    <td>${article.entries || "N/A"}</td>
                    <td class="content-cell">${article.content.substring(0, 50)}...</td>
                    <td><span class="status ${statusClass}">${article.status}</span></td>
                    <td>
                        <select class="status-select" onchange="changeStatus(${article.id}, this.value)">
                            <option value="public" ${article.status.toLowerCase() === 'public' ? 'selected' : ''}>Public</option>
                            <option value="private" ${article.status.toLowerCase() === 'private' ? 'selected' : ''}>Private</option>
                        </select>
                    </td>
                    <td>
                        <button class="edit-btn" onclick="editArticle(${article.id})">
                            <i class="fa-solid fa-pen"></i> Sửa
                        </button>
                        <button class="delete-btn" onclick="deleteArticle(${article.id})">
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = html;
    renderPagination(totalPages);
}

//// page

function renderPagination(totalPages) {
    const pageNumbersContainer = document.querySelector('.page-numbers');
    const paginationWrapper = document.querySelector('.pagination');
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = "";

    if (totalPages <= 1) {
        paginationWrapper.style.display = "none";
        return;
    }
    paginationWrapper.style.display = "flex";

   
    for (let i = 1; i <= totalPages; i++) {
        const span = document.createElement('span');
        span.innerText = i;
        span.className = (i === currentPage) ? "page active" : "page";
        span.onclick = () => {
            currentPage = i;
            renderArticles();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pageNumbersContainer.appendChild(span);
    }

    // CHUYEN TRANG
    const prevBtn = document.querySelectorAll('.page-btn')[0];
    const nextBtn = document.querySelectorAll('.page-btn')[1];

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderArticles();
        }
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderArticles();
        }
    };
    
    // DAU CUOI TRANG 
    prevBtn.style.opacity = (currentPage === 1) ? "0.5" : "1";
    prevBtn.style.pointerEvents = (currentPage === 1) ? "none" : "auto";
    nextBtn.style.opacity = (currentPage === totalPages) ? "0.5" : "1";
    nextBtn.style.pointerEvents = (currentPage === totalPages) ? "none" : "auto";
}

// ACTION FUNCS
window.editArticle = function(id) {
    localStorage.setItem('editArticleId', id);
    window.location.href = "./newarticleform.html";
}

window.changeStatus = function(id, newStatus) {
    const index = listArticles.findIndex(item => item.id === id);
    if (index !== -1) {
        listArticles[index].status = newStatus;
        localStorage.setItem('articles', JSON.stringify(listArticles));
        renderArticles(); 
    }
}

window.deleteArticle = function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        listArticles = listArticles.filter(item => item.id !== id);
        localStorage.setItem('articles', JSON.stringify(listArticles));
        renderArticles();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderArticles();
    renderProfile();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm("Bạn có muốn đăng xuất không?")) {
                localStorage.removeItem('currentUser');
                window.location.href = "./login.html";
            }
        };
    }

    const addBtn = document.getElementById('add-Article-Btn');
    if (addBtn) {
        addBtn.onclick = () => {
            localStorage.removeItem('editArticleId');
            window.location.href = "./newarticleform.html";
        };
    }
});