const users = [
    {
        "id": 1,
        "firstname": "Nguyen",
        "lastname": "Minh Hieu",
        "email": "minhhieu@gmail.com",
        "role" : "Admin",
        "status": "hoạt động",
        "password": "123456"
    },
    {
        "id": 2,
        "firstname": "Tang",
        "lastname": "Hieu Thanh",
        "email": "thanh@gmail.com",
        "role" : "user",
        "status": "hoạt động",
        "password": "abc123"
    },
    {
        "id": 3,
        "firstname": "no le",
        "lastname": "da den",
        "email": "swag@gmail.com",
        "role" : "user",
        "status": "hoạt động",
        "password": "187000"
    },
     {
        "id": 4,
        "firstname": "Tran",
        "lastname": "Minh Duc",
        "email": "ducky@gmail.com",
        "role" : "user",
        "status": "hoạt động",
        "password": "181836"
    },
];

const entries = [
    {
        "id" : 1,
        "name": "Nhật ký học tập"
    },
     {
        "id" : 2,
        "name": "Nhật ký mục tiêu và ké hoạch"
    },
     {
        "id" : 3,
        "name": "Nhật ký trải nghiệm học qua đời sống"
    },
]

const articles = [
    {
        "id": 1,
        "title": "DeadLine đầu tiên của kì học",
        "entries": "Nhật ký học tập",
        "content":"Hôm nay mình vừa nộp xong bài tập lớn , Mệt nhưng thấy rất nhẹ nhõm",
        "mood":"Căng thẳng",
        "status":"Private",
        "author":"hieu@gmail.com",
        "image": "",
        "date":"2025-02-25"
    },
    {
        "id": 2,
        "title": "Oh my GOD...",
        "entries": "Nhật ký học tập",
        "content":"Hôm nay tôi SẮP CHẾT RỒI",
        "mood":"Căng thẳng",
        "status":"Public",
        "author":"thanh@gmail.com",
        "image": "",
        "date":"2025-02-25"
    }
]


if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
    console.log("dữ liệu mẫu đã khởi tạo");
}

if (!localStorage.getItem('articles')) {
    localStorage.setItem('articles', JSON.stringify(articles));
}

if (!localStorage.getItem('entries')) {
    localStorage.setItem('entries', JSON.stringify(entries));
}