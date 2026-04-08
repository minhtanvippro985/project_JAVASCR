    let registerForm = document.getElementById('registerForm');
    let fNameInp = document.getElementById('firstName-input');
    let lNameInp = document.getElementById('lastName-Input');
    let emailInp = document.getElementById('email-Input');
    let passInp = document.getElementById('password-Input');
    let confirmInp = document.getElementById('confirm-Input');

    let emailErr = document.getElementById('email-err');
    let passErr = document.getElementById('password-err');
    let confirmErr = document.getElementById('confirmp-err');
    

    [emailErr, passErr, confirmErr].forEach(err => err.style.display = 'none'); // save đc 3
    const clearError = (element) => element.style.display = 'none';
    emailInp.oninput = () => clearError(emailErr);
    passInp.oninput = () => clearError(passErr);
    confirmInp.oninput = () => clearError(confirmErr);

    function formCheckValidate(){
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let isValid = true;

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if (emailInp.value.trim() === "") {
         emailErr.innerText = "*vui lòng nhập email";
         emailErr.style.display = 'block';
         isValid = false;

        } else if (!emailPattern.test(emailInp.value)) {
         emailErr.innerText = "*định dạng email không hợp lệ (vd: abc@gmail.com)";
         emailErr.style.display = 'block';
         isValid = false;

        } else if (users.find(user => user.email === emailInp.value)) {
         emailErr.innerText = "*email này đã được sử dụng";
         emailErr.style.display = 'block';
         isValid = false;
        } else {
   
        emailErr.style.display = 'none';
        }
        if (passInp.value.length < 6) {
            passErr.innerText = "*mật khẩu phải ít nhất 6 ký tự";
            passErr.style.display = 'block';
            isValid = false;
        }

        if (passInp.value !== confirmInp.value) {
            confirmErr.innerText = "*mật khẩu xác nhận không khớp";
            confirmErr.style.display = 'block';
            isValid = false;
        }
        return isValid

    }
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let validateCheck = formCheckValidate()
        if(validateCheck == true){
        const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: nextId,
            firstname: fNameInp.value,
            lastname: lNameInp.value,
            role : "user",
            status: "hoạt động",
            email: emailInp.value,
            password: passInp.value
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Đăng ký thành công!');
        window.location.href = '/pagesHTML/login.html'; 
        }else{
            alert("không thành công")
        }
    });