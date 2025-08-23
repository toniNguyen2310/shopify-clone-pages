🛒 Shopify Clone Pages


📋 Overview

Shopify Clone Pages is an experimental project that replicates Shopify’s Pages feature inside the Admin.

The main goals of this project are:

🚀 Learn how to build a Shopify App with Remix + Node.js.

🗄️ Replace Prisma with MongoDB for data storage.

🔑 Understand the OAuth flow, Shopify Admin API, and data handling.

☁️ Deploy the app on Vercel as if it were a real Shopify App.

This is my first project, intended to serve as a starter template for faster Shopify App development and deployment in the future.

🛠️ Tech Stack

Remix
 – Fullstack framework

Node.js
 – Backend runtime

Shopify API
 – Shopify Admin integration

MongoDB
 – Database

Vercel
 – Hosting & deployment

⚙️ Local Setup
1️⃣ Clone the repository
git clone https://github.com/toniNguyen2310/shopify-clone-pages.git
cd shopify-clone-pages

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create a .env file in the project root:

SHOPIFY_APP_URL="https://your-app-url.vercel.app"
SHOPIFY_API_KEY="your_api_key"
SHOPIFY_API_SECRET="your_api_secret"
SCOPES="read_products,write_products"
MONGODB_URI="your_mongo_connection_string"
MONGODB_DB_NAME="shopify_clone_pages"

4️⃣ Run locally
npm run dev


The app will be available at: http://localhost:3000

🚀 Deployment on Vercel

Push the code to GitHub.

Import the repository into Vercel
.

Add all environment variables in your Vercel project settings.

Deploy → Vercel will give you a live domain.

Register this URL in your Shopify Partners Dashboard
.

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
