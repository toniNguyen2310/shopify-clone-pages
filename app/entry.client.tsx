import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document, <RemixBrowser />);



// import { RemixBrowser } from "@remix-run/react";
// import { startTransition, StrictMode } from "react";
// import { hydrateRoot } from "react-dom/client";

// // Shopify Polaris i18n
// import { AppProvider } from "@shopify/polaris";
// import enTranslations from "@shopify/polaris/locales/en.json";

// startTransition(() => {
//   hydrateRoot(
//     document,
//     <StrictMode>
//       <AppProvider i18n={enTranslations}>
//         <RemixBrowser />
//       </AppProvider>
//     </StrictMode>
//   );
// });
