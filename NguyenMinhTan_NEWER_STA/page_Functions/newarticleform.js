let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let articlesTotal = JSON.parse(localStorage.getItem('articles')) || [];
let statusToggle = "Public";
let selectedImageData = ""; // Biến lưu dữ liệu ảnh (Base64)

const editId = localStorage.getItem('editArticleId');

if (!currentUser) {
    window.location.href = "../index.html";
}

// --- 1. XỬ LÝ KHI TRANG TẢI XONG (DOM CONTENT LOADED) ---
document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('article-image');

    // Nếu đang ở chế độ SỬA: Đổ dữ liệu cũ vào form
    if (editId) {
        const articleToEdit = articlesTotal.find(a => String(a.id) === String(editId));
        if (articleToEdit) {
            document.querySelector(".form-title").innerText = "Edit Article";
            document.getElementById("add-btn").innerText = "Update Article";

            document.getElementById("article-title").value = articleToEdit.title;
            document.getElementById("article-category").value = articleToEdit.entries;
            document.getElementById("article-mood").value = articleToEdit.mood;
            document.getElementById("article-content").value = articleToEdit.content;
            
            statusToggle = articleToEdit.status.toLowerCase();
            document.getElementById(`status-${statusToggle}`).checked = true;

        
            if (articleToEdit.image) {
                selectedImageData = articleToEdit.image;
                showPreview(selectedImageData);
            }
        }
    }

   
    dropArea.addEventListener('click', () => fileInput.click());

    
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

  
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });
});



// Hàm xử lý file ảnh và chuyển sang Base64
function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImageData = e.target.result;
            showPreview(selectedImageData);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Vui lòng chọn một file ảnh hợp lệ!");
    }
}

// Hàm hiển thị ảnh xem trước (Preview)
function showPreview(base64Data) {
    const dropArea = document.getElementById('drop-area');
    dropArea.innerHTML = `
        <img src="${base64Data}" style="max-width: 100%; max-height: 180px; border-radius: 10px; object-fit: cover;">
        <p style="margin-top: 10px; font-size: 12px; color: #666;">Click hoặc kéo thả để thay đổi ảnh</p>
    `;
    dropArea.style.borderColor = "#4CAF50";
}


function handleArticleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("article-title").value;
    const content = document.getElementById("article-content").value;
    const category = document.getElementById("article-category").value;
    const mood = document.getElementById("article-mood").value;

    if (!title || !content || !category) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (editId) {
        const index = articlesTotal.findIndex(a => String(a.id) === String(editId));
        if (index !== -1) {
            articlesTotal[index] = {
                ...articlesTotal[index], 
                title: title,
                entries: category,
                content: content,
                mood: mood,
                status: statusToggle,
                image: selectedImageData
            };
        }
        localStorage.removeItem('editArticleId'); 
    } else {
        
        let articleNew = {
            id: Date.now(),
            title: title,
            entries: category,
            content: content,
            mood: mood,
            status: statusToggle,
            image: selectedImageData, 
            date: new Date().toISOString().split('T')[0],
            author: currentUser.email
        };
        articlesTotal.push(articleNew);
    }

    localStorage.setItem('articles', JSON.stringify(articlesTotal));
    alert(editId ? "Cập nhật thành công!" : "Thêm bài viết thành công!");
    
    if (currentUser.role === "Admin" || currentUser.role === "Admin") {
        window.location.href = "./article_mananger_ADMIN.html";
    } else {
        window.location.href = "./myarticle_page.html"; 
    }
}


const form = document.getElementById("add-article-form");
if (form) {
    form.addEventListener("submit", handleArticleSubmit);
}

document.getElementById("close-modal").addEventListener("click", () => {
    localStorage.removeItem('editArticleId'); 
    window.history.back();
});

document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        statusToggle = e.target.value;
    });
});