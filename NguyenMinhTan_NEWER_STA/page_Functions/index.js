document.addEventListener("DOMContentLoaded", () => {
    const authSection = document.getElementById('header-auth-section');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    
    // Chỉ lấy những bài viết Public để hiển thị trang chủ
    const publicArticles = articles.filter(article => article.status.toLowerCase() === "public");

    // BIẾN QUẢN LÝ TRẠNG THÁI (PAGINATION & FILTER)
    let filteredArticles = [...publicArticles]; // Mảng bài viết sau khi filter
    let currentPage = 1;
    const rowsPerPage = 6; // Số bài viết mỗi trang

    if (currentUser && currentUser.role === "Admin") {
        window.location.href = "/pagesHTML/article_mananger_ADMIN.html";
        return;
    }

    // --- HÀM ĐIỀU HƯỚNG CHI TIẾT ---
    window.viewDetails = function(id) {
        localStorage.setItem('viewArticleId', id); 
        window.location.href = "/pagesHTML/article_details.html"; 
    };

    // --- HÀM LẤY ẢNH (Hỗ trợ Base64 và Placeholder) ---
    const getImg = (item, width, height) => {
        if (item.image && item.image.trim() !== "") {
            return item.image;
        }
        return `https://picsum.photos/seed/${item.id}/${width}/${height}`;
    };

    // --- 1. RENDER BỘ LỌC DANH MỤC (Lấy từ dữ liệu thực tế) ---
    function renderFilterCategories() {
        const filterContainer = document.getElementById('filter-post-btn');
        if (!filterContainer) return;

        // Lấy danh sách entries duy nhất từ publicArticles, loại bỏ null/undefined
        const uniqueCategories = [...new Set(publicArticles.map(a => a.entries).filter(e => e))];
        const allCategories = ["All blog posts", ...uniqueCategories];

        filterContainer.innerHTML = allCategories.map((cat, index) => `
            <span class="category-filter-item ${index === 0 ? 'active' : ''}" 
                  style="cursor:pointer; padding: 5px 15px; border-radius: 20px; transition: 0.3s;"
                  data-category="${cat}">
                ${cat}
            </span>
        `).join('');

        // Sự kiện click filter
        document.querySelectorAll('.category-filter-item').forEach(item => {
            item.addEventListener('click', function() {
                // Xử lý UI active
                document.querySelectorAll('.category-filter-item').forEach(i => {
                    i.classList.remove('active');
                    i.style.background = "none";
                    i.style.color = "inherit";
                });
                this.classList.add('active');
                this.style.background = "#7c3aed"; // Màu tím của bạn
                this.style.color = "#fff";

                const selectedCat = this.getAttribute('data-category');
                
                // Logic lọc bài viết
                if (selectedCat === "All blog posts") {
                    filteredArticles = [...publicArticles];
                } else {
                    filteredArticles = publicArticles.filter(a => a.entries === selectedCat);
                }
                
                currentPage = 1; // Reset về trang 1
                renderArticles();
            });
        });
    }

    // --- 2. RENDER BÀI VIẾT VÀ PHÂN TRANG ---
    function renderArticles() {
        // Sắp xếp bài viết mới nhất lên đầu
        const sorted = [...filteredArticles].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Tính toán cắt mảng bài viết theo trang
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedItems = sorted.slice(startIndex, endIndex);

        // Render vào Grid bài viết
        const articleGrid = document.querySelector('.article-grid');
        if (articleGrid) {
            if (paginatedItems.length === 0) {
                articleGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">Không tìm thấy bài viết nào.</div>`;
            } else {
                articleGrid.innerHTML = paginatedItems.map(item => `
                    <div class="article-card" onclick="viewDetails(${item.id})" style="cursor: pointer;">
                        <img src="${getImg(item, 400, 300)}" alt="${item.title}" style="object-fit: cover; height: 200px; width: 100%;">
                        <div class="card-body">
                            <p class="post-date">Date: ${item.date}</p>
                            <h3>${item.title} <i class="fa-solid fa-arrow-up-right-from-square"></i></h3>
                            <p>${item.content.substring(0, 100)}...</p>
                            <div class="card-footer">
                                <span class="category-tag">${item.entries || "General"}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        renderPaginationUI(sorted.length);
        renderRecentPosts(sorted); // Cập nhật luôn phần Recent theo filter (nếu muốn)
    }

    // --- 3. HÀM RENDER NÚT PHÂN TRANG ---
    function renderPaginationUI(totalItems) {
        const paginationNumbers = document.getElementById('pagination-numbers');
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        
        if (!paginationNumbers) return;
        paginationNumbers.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-num ${i === currentPage ? 'active' : ''}`;
            btn.innerText = i;
            if (i === currentPage) {
                btn.style.background = "#7c3aed";
                btn.style.color = "#fff";
            }
            btn.onclick = () => {
                currentPage = i;
                renderArticles();
                window.scrollTo({ top: 700, behavior: 'smooth' }); // Cuộn lên khi sang trang
            };
            paginationNumbers.appendChild(btn);
        }

        // Disable/Enable nút Prev/Next
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = (currentPage === totalPages || totalPages === 0);
    }

    // Nút điều hướng Prev/Next
    document.getElementById('prev-page').onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderArticles();
        }
    };
    document.getElementById('next-page').onclick = () => {
        const totalPages = Math.ceil(filteredArticles.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderArticles();
        }
    };

    // --- HÀM RENDER RECENT POSTS (Cố định 3 bài mới nhất) ---
    function renderRecentPosts(sortedArticles) {
        const recentMain = document.querySelector('.recent-main-card');
        const recentSideContainer = document.querySelector('.recent-side-cards');

        if (sortedArticles.length > 0 && currentPage === 1) {
            const main = sortedArticles[0];
            if (recentMain) {
                recentMain.setAttribute('onclick', `viewDetails(${main.id})`);
                recentMain.style.cursor = "pointer";
                recentMain.innerHTML = `
                    <img src="${getImg(main, 800, 450)}" alt="${main.title}" style="object-fit: cover;">
                    <div class="card-content">
                        <p class="post-date">Date: ${main.date}</p>
                        <h3 class="post-title">${main.title}</h3>
                        <p class="post-excerpt">${main.content.substring(0, 150)}...</p>
                        <span class="category-tag tag-blue">${main.entries || "General"}</span>
                    </div>
                `;
            }

            let sideCardsHTML = '';
            for (let i = 1; i < 3 && i < sortedArticles.length; i++) {
                const side = sortedArticles[i];
                sideCardsHTML += `
                    <div class="side-card" onclick="viewDetails(${side.id})" style="cursor: pointer;">
                        <img src="${getImg(side, 400, 250)}" alt="${side.title}" style="object-fit: cover;">
                        <div class="side-card-content">
                            <p class="post-date">Date: ${side.date}</p>
                            <h3 class="post-title">${side.title}</h3>
                            <p class="post-excerpt">${side.content.substring(0, 80)}...</p>
                            <span class="category-tag tag-purple">${side.entries || "General"}</span>
                        </div>
                    </div>
                `;
            }
            if (recentSideContainer) recentSideContainer.innerHTML = sideCardsHTML;
        }
    }

    // --- SEARCH LOGIC ---
    const searchInput = document.getElementById('search-article-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            filteredArticles = publicArticles.filter(a => 
                a.title.toLowerCase().includes(keyword) || a.content.toLowerCase().includes(keyword)
            );
            currentPage = 1;
            renderArticles();
        });
    }

    // --- AUTH RENDER & OTHERS ---
    const myPostBtn = document.getElementById('view-my-post-btn');
    if (myPostBtn) {
        myPostBtn.onclick = () => {
            if (!currentUser) {
                alert("Bạn phải đăng nhập tài khoản!");
                window.location.href = "/pagesHTML/login.html";
                return;
            }
            window.location.href = "/pagesHTML/myarticle_page.html";
        };
    }

    renderAuth(currentUser, authSection);
    renderFilterCategories(); // Chạy bộ lọc danh mục
    renderArticles(); // Chạy render bài viết lần đầu
});

function setupAvatarChange() {
    const avatarInput = document.getElementById('change-avatar-input');
    if (!avatarInput) return;

    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra dung lượng file (dưới 2MB để tránh lỗi lưu trữ LocalStorage)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;

                let currentUser = JSON.parse(localStorage.getItem('currentUser'));
                currentUser.avatar = base64Image;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                let allUsers = JSON.parse(localStorage.getItem('users')) || [];
                const userIdx = allUsers.findIndex(u => u.email === currentUser.email);
                if (userIdx !== -1) {
                    allUsers[userIdx].avatar = base64Image;
                    localStorage.setItem('users', JSON.stringify(allUsers));
                }

                const mainAva = document.getElementById('user-avatar-main');
                const dropAva = document.getElementById('user-avatar-dropdown');
                if (mainAva) mainAva.src = base64Image;
                if (dropAva) dropAva.src = base64Image;

                alert("Cập nhật ảnh đại diện thành công!");
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderAuth(user, section) {
    if (user) {
        // Lấy ảnh từ user.avatar (nếu có), không thì dùng mặc định
        const userImg = user.avatar || '/assets/imagers/user_PFP.png';

        section.innerHTML = `
            <div class="user-profile">
                <img src="${userImg}" alt="Avatar" class="avatar-img" id="user-avatar-main">
                <div class="dropdown-menu">
                    <div class="user-info">
                        <img src="${userImg}" alt="Avatar" id="user-avatar-dropdown">
                        <div>
                            <strong>${user.firstname} ${user.lastname}</strong>
                            <p>${user.email}</p>
                        </div>
                    </div>
                    <hr>
                    <ul>
                        <li>View profile</li>
                        <li>
                            <label for="change-avatar-input" style="cursor: pointer; display: block; width: 100%;">
                                Update Profile picture
                            </label>
                            <input type="file" id="change-avatar-input" accept="image/*" style="display: none;">
                        </li>
                        <li>Change password</li>
                        <li class="logout" id="logout-btn" style="cursor:pointer; color:red;">Log out</li>
                    </ul>
                </div>
            </div>
        `;

        setupAvatarChange();

        document.getElementById('logout-btn').onclick = () => {
            if (confirm("Đăng xuất?")) {
                localStorage.removeItem('currentUser');
                window.location.reload();
            }
        };
    } else {
        section.innerHTML = `
            <div class="auth-buttons">
                <a href="pagesHTML/login.html" class="btn-login" style="margin-right:10px">Login</a>
                <a href="/pagesHTML/register.html" class="btn-register">Register</a>
            </div>
        `;
    }
}

function openModal(id) {
    document.getElementById(id).style.display = "block";
}
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];

    const viewProfileBtn = document.querySelector('.dropdown-menu li:nth-child(1)');
    viewProfileBtn.onclick = () => {
        if (!currentUser) return alert("Vui lòng đăng nhập!");
        
        document.getElementById('profile-modal-img').src = currentUser.avatar || '/assets/imagers/user_PFP.png';
        document.getElementById('profile-modal-name').innerText = `${currentUser.firstname} ${currentUser.lastname}`;
        document.getElementById('profile-modal-email').innerText = currentUser.email;
        
        openModal('modal-view-profile');
    };

    const changePassBtn = document.querySelector('.dropdown-menu li:nth-child(3)');
    changePassBtn.onclick = () => openModal('modal-change-pass');

    const formChangePass = document.getElementById('form-change-pass');
    formChangePass.onsubmit = (e) => {
        e.preventDefault();
        
        const oldPass = document.getElementById('old-pass').value;
        const newPass = document.getElementById('new-pass').value;
        const confirmPass = document.getElementById('confirm-new-pass').value;

        if (oldPass !== currentUser.password) {
            return alert("Mật khẩu cũ không chính xác!");
        }
        if (newPass.length < 6) {
            return alert("Mật khẩu mới phải từ 6 ký tự trở lên!");
        }
        if (newPass !== confirmPass) {
            return alert("Xác nhận mật khẩu mới không khớp!");
        }

        const userIdx = allUsers.findIndex(u => u.email === currentUser.email);
        if (userIdx !== -1) {
            allUsers[userIdx].password = newPass;
            localStorage.setItem('users', JSON.stringify(allUsers));
            
            currentUser.password = newPass;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            alert("Đổi mật khẩu thành công!");
            formChangePass.reset();
            closeModal('modal-change-pass');
        }
    };

    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    };
});