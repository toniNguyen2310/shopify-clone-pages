# 🛒 Shopify Clone Pages

[![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)  
[![Remix](https://img.shields.io/badge/Framework-Remix-000?logo=remix&logoColor=white)](https://remix.run)  
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)](https://mongodb.com)

---

## 📋 Overview

**Shopify Clone Pages** is an experimental project that replicates Shopify’s **Pages** feature in the Admin dashboard.

The main goals of this project:

- 🚀 Learn how to build a **Shopify App** with **Remix + Node.js**.
- 🗄️ Replace Prisma with **MongoDB** for data storage.
- 🔑 Understand **OAuth flow**, Shopify Admin API, and data handling.
- ☁️ Deploy the app on **Vercel** as a real Shopify App.

> This is a **first project**, serving as a **starter template** for building Shopify Apps faster in the future.

---

## 🛠️ Tech Stack

- **Framework:** [Remix](https://remix.run)  
- **Backend:** [Node.js](https://nodejs.org)  
- **Shopify Integration:** [Shopify API](https://shopify.dev/docs/api)  
- **Database:** [MongoDB](https://www.mongodb.com)  
- **Hosting:** [Vercel](https://vercel.com)  

---

# Shopify Clone Pages

⚙️ **Local Setup**

1️⃣ Clone the repository

```bash
git clone https://github.com/toniNguyen2310/shopify-clone-pages.git
cd shopify-clone-pages
2️⃣ Install dependencies

bash
Sao chép
Chỉnh sửa
npm install
3️⃣ Configure environment variables

Tạo file .env ở thư mục gốc:

env
Sao chép
Chỉnh sửa
SHOPIFY_APP_URL="https://your-app-url.vercel.app"
SHOPIFY_API_KEY="your_api_key"
SHOPIFY_API_SECRET="your_api_secret"
SCOPES="read_products,write_products"
MONGODB_URI="your_mongo_connection_string"
MONGODB_DB_NAME="shopify_clone_pages"
4️⃣ Run locally

bash
Sao chép
Chỉnh sửa
npm run dev
Truy cập ứng dụng tại: http://localhost:3000

🚀 Deployment on Vercel

Push code lên GitHub.

Import repository vào Vercel.

Thêm tất cả biến môi trường trong Vercel project settings.

Deploy → Vercel sẽ cung cấp cho bạn một live domain.

Đăng ký URL này trong Shopify Partners Dashboard.

📌 Roadmap

Add Shopify Polaris UI components.

Implement webhooks for real-time syncing.

Full CRUD Pages (similar to Shopify Admin).

Add automated testing.

Publish as a real Shopify App.

🤝 Contributing

Contributions are welcome 🙌.
Fork this repo, create a new branch, and submit a PR.

📜 License

MIT License © 2025 toniNguyen2310


