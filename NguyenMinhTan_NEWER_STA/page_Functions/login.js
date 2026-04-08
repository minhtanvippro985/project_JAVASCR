let loginForm = document.querySelector('form');
let emailInput = document.getElementById('email-input');
let passwordInput = document.getElementById('password-input');
let errorMsg = document.getElementById('error-msg');

let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (currentUser) {
    if (currentUser.role === "Admin") {
        window.location.href = "/pagesHTML/article_mananger_ADMIN.html";
    } else {
        window.location.href = "/index.html";
    }
}
function hideError() {
    errorMsg.style.display = 'none';
}
emailInput.addEventListener('input', hideError);
passwordInput.addEventListener('input', hideError);

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    let email = emailInput.value.trim();
    let password = passwordInput.value.trim();


    let userFound = storedUsers.find(user => 
        user.email === email && user.password === password
    );
    if (userFound) {
        errorMsg.style.display = 'none';
        localStorage.setItem('currentUser', JSON.stringify(userFound));
        if (userFound.role === "Admin") {
  
            window.location.href = "./article_mananger_ADMIN.html";
        } else {
            alert("!");
            window.location.href = '/index.html'; 
        }
    } else {
      
        errorMsg.style.display = 'block';   
        passwordInput.value = '';
    }
});