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

## 📂 Project Structure

```bash
shopify-clone-pages/
├── app/                # Remix routes, UI components
├── prisma/             # (Not used, replaced by MongoDB)
├── public/             # Static assets
├── utils/              # Shopify API + DB helpers
├── vercel.json         # Deployment config
└── package.json
