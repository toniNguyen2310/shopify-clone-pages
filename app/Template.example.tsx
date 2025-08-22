// shopify - app /
// ├── app /                           # Remix app chính
// │   ├── entry.client.tsx          # Entry point cho client - side hydration
// │   ├─ entry.server.tsx          # Entry point cho server - side rendering
// │   ├── root.tsx                  # Root layout với AppProvider
// │   ├── shopify.server.ts         # Shopify configuration(thay thế prisma)
// │   ├── routes /                   # File - based routing
// │   │   ├── app._index.tsx       # Main app dashboard
// │   │   ├── app.jsx              # App layout wrapper
// │   │   ├── app.additional.jsx   # Additional app pages
// │   │   ├── auth.$.tsx           # OAuth authentication handler
// │   │   └── webhooks.app.uninstalled.tsx # Webhook handlers
// │   ├── components /              # Reusable React components
// │   │   ├── NavMenu.tsx          # Navigation menu(App Bridge)
// │   │   ├── ProductsCard.tsx     # Product display cards
// │   │   └── ui /                  # UI components(Polaris wrappers)
// │   │       ├── Button.tsx
// │   │       ├── Card.tsx
// │   │       └── Layout.tsx
// │   ├── models /                  # MongoDB Models(thay thế Prisma)
// │   │   ├── Session.ts           # Session storage model
// │   │   ├── Shop.ts              # Shop information model
// │   │   └── index.ts             # Model exports
// │   ├── db /                      # Database utilities
// │   │   ├── connection.ts        # MongoDB connection
// │   │   └── session.storage.ts   # Custom MongoDB session storage
// │   └── utils /                   # Utility functions
// │       ├── db.utils.ts
// │       └── helpers.ts
// ├── public /                       # Static assets
// │   ├── favicon.ico
// │   └── shopify.svg
// ├── extensions /                   # Shopify extensions(optional)
// ├── shopify.app.toml             # App configuration file
// ├── package.json
// ├── .env                         # Environment variables
// ├── vite.config.ts              # Vite configuration(thay remix.config.js)
// └── tsconfig.json               # TypeScript configuration