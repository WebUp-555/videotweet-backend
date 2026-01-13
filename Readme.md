VideoTweet Backend (Work in Progress)

Backend service for a video-based microblogging application, currently focused on authentication, token management, and video upload functionality. This project is under active development.


---

✅ Implemented Features

User registration and login

Password hashing using bcrypt

JWT-based authentication (access & refresh tokens)

Protected routes using auth middleware

Video upload functionality

Media handling with Multer

Cloudinary integration for video storage (if used)



---

🛠 Tech Stack

Node.js

Express.js

MongoDB & Mongoose

JWT (Access & Refresh Tokens)

bcrypt

Multer

Cloudinary / Local storage



---

📁 Project Structure

videotweet-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── app.js
├── .env
├── package.json
└── README.md


---

🔐 Authentication Overview

Users authenticate using email and password

Passwords are securely hashed

On successful login, the server issues:

Access Token (short-lived)

Refresh Token (long-lived)


JWT tokens are validated via middleware for protected routes



---

📤 Video Upload

Authenticated users can upload videos

Files are processed using Multer

Uploaded videos are stored in cloud/local storage

Video metadata is stored in MongoDB



---

⚙️ Environment Variables

PORT=8000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret


---

▶️ Run Locally

npm install
npm run dev

Server runs locally at:
http://localhost:8000


---

🚧 Status

This project is in progress.
Upcoming features include posts, likes, comments, and follow system.


---

👨‍💻 Author

Shamsheer 
Backend Developer