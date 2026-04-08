document.addEventListener("DOMContentLoaded", () => {
    const viewId = localStorage.getItem('viewArticleId');
    let allArticles = JSON.parse(localStorage.getItem('articles')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!viewId) {
        alert("Không tìm thấy bài viết!");
        window.history.back();
        return;
    }
    // TÌM BÀI
    let article = allArticles.find(arti => String(arti.id) === String(viewId));

    if (article) {
        const refreshAuthor = () => {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const authorInfo = users.find(u => u.email === article.author || u.lastname === article.author);
            const authorImg = document.querySelector('.post-main .avatar');
            
            if (authorImg) {
                authorImg.src = authorInfo?.avatar || authorInfo?.img || '/assets/imagers/user_PFP.png';
            }
        };
        refreshAuthor();

        document.querySelector('.post-title').innerText = article.title;
        document.querySelector('.post-text').innerText = article.content;

        // --- 2. RENDER ẢNH BÀI VIẾT 
        if (article.image) {
            const contentCard = document.querySelector('.post-content-card');
            const oldImg = contentCard.querySelector('.post-feature-img');
            if (oldImg) oldImg.remove(); // Xóa ảnh cũ nếu có

            const imgTag = document.createElement('img');
            imgTag.src = article.image;
            imgTag.className = 'post-feature-img';
            
            // Style giúp ảnh luôn fit vào khung, không bị to quá khổ
            Object.assign(imgTag.style, {
                width: "100%",
                maxWidth: "100%",    // Không rộng hơn cha
                maxHeight: "400px",   // Giới hạn chiều cao vừa đủ nhìn
                objectFit: "contain", // Giữ tỉ lệ, không bị méo
                borderRadius: "12px",
                marginBottom: "20px",
                display: "block",
                backgroundColor: "#f8f9fa" // Nền nhẹ nếu ảnh nhỏ hơn khung
            });

            contentCard.insertBefore(imgTag, document.querySelector('.post-title'));
        }

        // --- 3. LOGIC LIKE 
        const actionItems = document.querySelectorAll('.action-item');
        
        const renderStats = () => {
            const likesCount = article.likedBy ? article.likedBy.length : (article.likes || 0);
            const replies = article.comments ? article.comments.length : 0;

            const hasLiked = currentUser && article.likedBy && article.likedBy.includes(currentUser.email);
            
            // Cập nhật số Like 
            actionItems[0].innerHTML = `${likesCount} Like <i class="${hasLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i>`;
            actionItems[0].style.color = hasLiked ? "#007bff" : ""; // Đổi màu xanh nếu đã like

            // Cập nhật số Replies 
            actionItems[1].innerHTML = `${replies} Replies <i class="fa-regular fa-comment"></i>`;
            
            // Cập nhật nút đếm comment phía dưới
            const commentCountBtn = document.getElementById('btn-view-comments');
            if (commentCountBtn) {
                commentCountBtn.innerHTML = `View all ${replies} comments <i class="fa-solid fa-chevron-down"></i>`;
            }
        };
        renderStats();

        // Sự kiện Like
        actionItems[0].style.cursor = "pointer";
        actionItems[0].onclick = () => {
            if (!currentUser) {
                alert("Vui lòng đăng nhập để Like!");
                return;
            }

            // Khởi tạo mảng likedBy nếu chưa có
            if (!article.likedBy) article.likedBy = [];

            const userIndex = article.likedBy.indexOf(currentUser.email);

            if (userIndex === -1) {
                // Nếu chưa like -> Thêm vào mảng 
                article.likedBy.push(currentUser.email);
            } else {
                // Nếu đã like rồi -> Xóa khỏi mảng
                article.likedBy.splice(userIndex, 1);
            }
            
            article.likes = article.likedBy.length;
            
            saveData();
            renderStats(); 
        };

        // --- 4. RENDER DANH SÁCH COMMENT  ---
        renderComments(article); 

        const btnSend = document.getElementById('btn-send-comment');
        const inputComment = document.getElementById('input-comment');

        if (btnSend) {
            btnSend.onclick = () => {
                if (!currentUser) {
                    alert("Vui lòng đăng nhập để bình luận!");
                    return;
                }
                const text = inputComment.value.trim();
                if (text === "") return;

                allArticles = JSON.parse(localStorage.getItem('articles')) || [];
                article = allArticles.find(arti => String(arti.id) === String(viewId));

                const newComment = {
                    id: Date.now(),
                    userEmail: currentUser.email, // LƯU EMAIL ĐỂ DÒ ẢNH/TÊN MỚI KHI RENDER
                    userName: `${currentUser.firstname} ${currentUser.lastname}`,
                    content: text,
                    date: new Date().toLocaleString()
                };

                if (!article.comments) article.comments = [];
                article.comments.push(newComment); // Thêm comment vào mảng

                if (saveData()) {
                    inputComment.value = ""; 
                    renderComments(article); // Vẽ lại danh sách comment
                    renderStats(); // Cập nhật lại số lượng Replies ở trên
                }
            };
        }

        // Hàm lưu dữ liệu an toàn
        function saveData() {
            try {
                localStorage.setItem('articles', JSON.stringify(allArticles));
                return true;
            } catch (e) {
                console.error("Lỗi lưu trữ:", e);
                alert("Bộ nhớ trình duyệt đầy, không thể lưu thêm dữ liệu! Hãy xóa bớt bài viết cũ.");
                return false;
            }
        }
    }
});

// --- 5. SỰ KIỆN NÚT TRỜ VỀ ---
document.getElementById("btn-back")?.addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/index.html';
    }
});

// --- HÀM RENDER COMMENT (ĐÃ FIX LỖI ĐỒNG BỘ ẢNH CŨ) ---
function renderComments(article) {
    const commentList = document.getElementById('comments-list');
    const comments = article.comments || [];
    
    const latestUsers = JSON.parse(localStorage.getItem('users')) || [];

    if (comments.length === 0) {
        commentList.innerHTML = `<p style="color:#888; font-size:0.9rem; padding:10px; text-align:center;">Chưa có bình luận nào. Hãy là người đầu tiên!</p>`;
        return;
    }

    commentList.innerHTML = comments.map(cmt => {
        const user = latestUsers.find(u => u.email === cmt.userEmail);
        
        const currentAvatar = user?.avatar || user?.img || '/assets/imagers/user_PFP.png';
        const currentName = user ? `${user.firstname} ${user.lastname}` : cmt.userName;

        return `
            <div class="comment-item" style="margin-bottom: 15px; display: flex; gap: 10px; align-items: flex-start;">
                <img src="${currentAvatar}" alt="User" class="avatar-small" 
                     style="width:35px; height:35px; border-radius:50%; object-fit:cover; flex-shrink: 0;">
                <div class="comment-bubble" style="background:#f1f2f6; padding:10px 15px; border-radius:18px; flex:1;">
                    <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="font-size: 0.85rem; color: #333;">${currentName}</strong>
                        <small style="color: #999; font-size: 0.7rem;">${cmt.date}</small>
                    </div>
                    <p class="comment-text" style="margin: 0; font-size: 0.9rem; line-height: 1.4; color:#444;">${cmt.content}</p>
                </div>
            </div>
        `;
    }).reverse().join('');
}