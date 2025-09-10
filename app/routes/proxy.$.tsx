// app/routes/proxy.$.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { connectDb } from "app/db.server";
import { ShopifyPageId } from "app/lib/utils/useShopifyPageId ";
import { ShopTheme } from "app/models/Theme";
import { authenticate } from "app/shopify.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  console.log("=== PROXY LOADER CALLED ===");

  try {
    const { admin, liquid } = await authenticate.public.appProxy(request);
    const idNumber = params["*"];
    const pageId = ShopifyPageId.build(idNumber as string)
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "demo-shop";
    let bodyPage: string | undefined;
    let titlePage: string | undefined;
    let template: string | undefined;
    if (admin) {
      const response = await admin.graphql(
        `
        query getPage($id: ID!) {
          page(id: $id) {
            id
            title
            body
            handle
            templateSuffix
          }
        }
      `,
        { variables: { id: pageId } }
      );

      const data = await response.json();
      console.log("pageAPI1>>> ", data?.data?.page);
      bodyPage = data?.data?.page.body
      titlePage = data?.data?.page.title
      template = data?.data?.page.templateSuffix
      if (!bodyPage && template) {
        console.log('NO')
        bodyPage = loadTemplateBySuffix(template);

      }
      if (pageId) {
        console.log('bodyPageAfterGenHtml>> ', bodyPage, template)
        // const html = generatePreviewHTML(pageId, shop, bodyPage, titlePage);
        const html = generatePreviewHTMLWithLiquid(pageId, shop, bodyPage, titlePage, template ? loadTemplateBySuffix(template) : undefined);
        return liquid(html);
      }


    } else {
      // ❌ Không có admin, chỉ dùng được liquid
      console.log("Admin API NOT available in proxy");
    }

    if (!verifyShopifyProxyRequest(request)) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Example API call



  } catch (error) {
    console.error("❌ Error loading page:", error);
    throw new Response("Internal server error", { status: 500 });
  }
}


function verifyShopifyProxyRequest(request: Request): boolean {
  // Simple verification - check if request has shop parameter
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');

  // Trong production, bạn nên verify signature
  // Shopify sends signature in query params for verification
  return !!shop && shop.includes('.myshopify.com');
}

function generatePreviewHTML(pageId: string, shop: string, bodyPage?: string, titlePage?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview - ${pageId}</title>
      <style>
      .content-for-layout {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          width: 100%;
        }
        title {
          color: #000000ff;
        }
        .preview-badge {
          display: inline-block;
          background: #007ace;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .shop-info {
          color: #666;
          font-size: 16px;
          margin-top: 20px;
        }
        .page-id {
          font-family: 'Monaco', 'Menlo', monospace;
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          color: #e74c3c;
          font-weight: bold;
        }
        .page-body {
          color: #000000;

        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <h1 class='title'>${titlePage}</h1>
         ${bodyPage
      ? `${bodyPage} `
      : "<div class='page-body'><em>No content available </em></div>"
    }
   
      </div>
      
      <script>
        // Optional: Add some interactivity
        console.log('Preview loaded for page:', '${pageId}');
        console.log('Shop:', '${shop}');
        
        // You can add more JavaScript here for dynamic content
      </script>
    </body>
    </html>
  `;
}

function generatePreviewHTMLWithLiquid(
  pageId: string,
  shop: string,
  bodyPage?: string,
  titlePage?: string,
  templateContent?: string // thêm tham số này
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview - ${pageId}</title>
      <style>
      .content-for-layout {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          width: 100%;
        }
        title {
          color: #000000ff;
        }
        .preview-badge {
          display: inline-block;
          background: #007ace;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .shop-info {
          color: #666;
          font-size: 16px;
          margin-top: 20px;
        }
        .page-id {
          font-family: 'Monaco', 'Menlo', monospace;
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          color: #e74c3c;
          font-weight: bold;
        }
        .page-body {
          color: #000000;

        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <h1 class='title'>${titlePage}</h1>
         ${bodyPage
      ? `${bodyPage} `
      : "<div class='page-body'><em>No content available </em></div>"
    }
    ${templateContent
      ? `<div class="template-section">${templateContent}</div>`
      : ''
    }
   
      </div>
      
      <script>
        // Optional: Add some interactivity
        console.log('Preview loaded for page:', '${pageId}');
        console.log('Shop:', '${shop}');
        
        // You can add more JavaScript here for dynamic content
      </script>
    </body>
    </html>
  `;
}


function loadTemplateBySuffix(templateSuffix: string): string {
  switch (templateSuffix) {
    case "contact":
      return `
        <section class="contact-form">
          <h2>Contact Us</h2>
          <form>
            <label>Name</label>
            <input type="text" />
            <label>Message</label>
            <textarea></textarea>
            <button type="submit">Send</button>
          </form>
        </section>
      `;
    case "about":
      return `
        <section class="about">
          <h2>About Us</h2>
          <p>This is a fake about section.</p>
        </section>
      `;
    default:
      return `<div>No template for ${templateSuffix}</div>`;
  }
}