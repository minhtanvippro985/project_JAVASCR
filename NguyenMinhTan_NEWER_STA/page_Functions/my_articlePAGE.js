document.addEventListener("DOMContentLoaded", () => {
    const authSection = document.getElementById('header-auth-section');
    const articleContainer = document.getElementById('article-list-container');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allArticles = JSON.parse(localStorage.getItem('articles')) || [];

    if (!currentUser) {
        alert("Làm ơn đăng nhập trước!");
        window.location.href = "/pagesHTML/login.html";
        return;
    }
    document.getElementById("headerbutton").addEventListener("click", () => {
        window.location.href = "/index.html";
    });
    renderHeader(currentUser, authSection);

    const myArticles = allArticles.filter(art => art.author === currentUser.lastname || art.author === currentUser.email);

    window.viewDetails = function(id) {
        localStorage.setItem('viewArticleId', id); 
        window.location.href = "/pagesHTML/article_details.html"; 
    };

    function renderMyArticles(data) {
        if (data.length === 0) {
            articleContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Bạn chưa có bài viết nào. Hãy thêm bài viết mới!</p>`;
            return;
        }

        articleContainer.innerHTML = data.map(item => `
            <div class="article-card" onclick="viewDetails(${item.id})" style="cursor: pointer;">
                <img src="${item.image || '/assets/imagers/workday.png'}" alt="post">
                <div class="card-body">
                    <span class="post-date">Date: ${item.date}</span>
                    <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
                    <h3>${item.title} <i class="fa-solid fa-arrow-up-right-from-square"></i></h3>
                    <p>${item.content.substring(0, 120)}...</p>
                    <div class="card-footer">
                        <span class="category-tag">${item.entries}</span>
                        <a href="javascript:void(0)" class="edit-link" onclick="event.stopPropagation(); editMyArticle(${item.id})">
                            <i class="fa-solid fa-pen-to-square"></i> Edit your post
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderMyArticles(myArticles);

    // //////////////////////// add
    document.getElementById('add-new-btn').addEventListener("click", () => {
        localStorage.removeItem('editArticleId');
        window.location.href = "/pagesHTML/newarticleform.html";
    });

    // ////////////////  search
    const searchInput = document.getElementById('search-article-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = myArticles.filter(a => 
                a.title.toLowerCase().includes(keyword) || 
                a.content.toLowerCase().includes(keyword)
            );
            renderMyArticles(filtered);
        });
    }
});
//////////////////// EDIT
function editMyArticle(id) {
    localStorage.setItem('editArticleId', id);
    window.location.href = "/pagesHTML/newarticleform.html";
}

function renderHeader(user, section) {
    section.innerHTML = `
        <div class="user-profile">
            <img src="${user.avatar || '/assets/imagers/user_PFP.png'}" alt="Avatar" class="avatar-img">
            <div class="dropdown-menu">
                <div class="user-info">
                    <img src="${user.avatar || '/assets/imagers/user_PFP.png'}" alt="Avatar">
                    <div>
                        <strong>${user.firstname} ${user.lastname}</strong>
                        <p>${user.email}</p>
                    </div>
                </div>
                <hr>
                <ul>
                    <li>View profile</li>
                    <li><a href="#" style="text-decoration: none;">Update Profile</a></li>
                    <li><a href="#" style="text-decoration: none;">Change password</a></li>
                    <li class="logout" id="logout-btn" style="cursor:pointer; color:red;">Log out</li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm("Bạn có muốn đăng xuất không?")) {
            localStorage.removeItem('currentUser');
            window.location.href = "/index.html";
        }
    });
}