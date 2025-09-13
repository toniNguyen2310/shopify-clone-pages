// app/routes/proxy.$.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { GET_PROXY_PAGE_QUERY } from "app/graphql";
import { ShopifyPageId } from "app/utils/helpers";

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
    let templateContent: string | undefined;

    if (admin) {
      const response = await admin.graphql(GET_PROXY_PAGE_QUERY, { variables: { id: pageId } });

      const data = await response.json();
      console.log("pageAPI1>>> ", data?.data?.page);
      bodyPage = data?.data?.page.body
      titlePage = data?.data?.page.title
      template = data?.data?.page.templateSuffix
      if (template) {
        templateContent = loadTemplateBySuffix(template);
      }
      if (!bodyPage) {
        bodyPage = '';
      }
      if (pageId) {
        console.log('bodyPageAfterGenHtml>> ', bodyPage, template)
        // const html = generatePreviewHTML(pageId, shop, bodyPage, titlePage);
        const html = generatePreviewHTMLWithLiquid(pageId, shop, bodyPage, titlePage, templateContent);
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

        .title {
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
   <div class="preview-title-body">
        <h1 class='title'>${titlePage}</h1>
         ${bodyPage
    && `${bodyPage} `
    }
   </div>
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
        <section style="padding:60px 20px;  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height:100vh; display:flex; align-items:center; justify-content:center;">
          <div style="max-width:500px; width:100%; background:rgba(255,255,255,0.95); backdrop-filter:blur(10px); border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(0,0,0,0.1); border:1px solid #667eea;">
       
            <form style="display:flex; flex-direction:column; gap:20px;">
              <div style="display:flex; gap:15px;">
                <div style="flex:1;">
                  <input placeholder="Name" type="text"
                    style="width:100%; padding:15px 20px; border:2px solid #f0f0f0; border-radius:12px; font-size:14px; background:#fafafa; transition:all 0.3s ease; outline:none; box-sizing:border-box;"
                    onfocus="this.style.borderColor='#667eea'; this.style.background='#fff';"
                    onblur="this.style.borderColor='#f0f0f0'; this.style.background='#fafafa';" />
                </div>
                <div style="flex:1;">
                  <input placeholder="Email *" type="email"
                    style="width:100%; padding:15px 20px; border:2px solid #f0f0f0; border-radius:12px; font-size:14px; background:#fafafa; transition:all 0.3s ease; outline:none; box-sizing:border-box;"
                    onfocus="this.style.borderColor='#667eea'; this.style.background='#fff';"
                    onblur="this.style.borderColor='#f0f0f0'; this.style.background='#fafafa';" />
                </div>
              </div>
              
              <div>
                <input placeholder="Phone number" type="tel"
                  style="width:100%; padding:15px 20px; border:2px solid #f0f0f0; border-radius:12px; font-size:14px; background:#fafafa; transition:all 0.3s ease; outline:none; box-sizing:border-box;"
                  onfocus="this.style.borderColor='#667eea'; this.style.background='#fff';"
                  onblur="this.style.borderColor='#f0f0f0'; this.style.background='#fafafa';" />
              </div>
              
              <div>
                <textarea placeholder="Comment" rows="5"
                  style="width:100%; padding:15px 20px; border:2px solid #f0f0f0; border-radius:12px; font-size:14px; background:#fafafa; transition:all 0.3s ease; outline:none; resize:vertical; min-height:120px; font-family:inherit; box-sizing:border-box;"
                  onfocus="this.style.borderColor='#667eea'; this.style.background='#fff';"
                  onblur="this.style.borderColor='#f0f0f0'; this.style.background='#fafafa';"></textarea>
              </div>
              
              <button type="submit"
                style="width:100%; padding:16px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; border:none; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.3s ease; margin-top:10px; letter-spacing:0.5px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(102,126,234,0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                Send Message
              </button>
            </form>
            
            <div style="margin-top:30px; padding-top:25px; border-top:1px solid #eee; text-align:center;">
              <p style="font-size:13px; color:#888; margin:0;">
                Or reach us directly at <strong style="color:#667eea;">hello@company.com</strong>
              </p>
            </div>
          </div>
        </section>
      `;

    case "about":
      return `
        <section style="padding:80px 20px; background:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; position:relative; overflow:hidden;">
          <!-- Background decoration -->
          <div style="position:absolute; top:0; left:0; right:0; bottom:0; background-image:radial-gradient(circle at 25% 25%, rgba(102,126,234,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(118,75,162,0.1) 0%, transparent 50%); pointer-events:none;"></div>
          
          <div style="max-width:1200px; margin:0 auto; position:relative; z-index:1;">
            <!-- Header -->
            <div style="text-align:center; margin-bottom:60px;">
              <h2 style="font-size:42px; font-weight:800; margin-bottom:16px; color:#2d3748; letter-spacing:-1px; position:relative; display:inline-block;">
                About Our Journey
                <div style="position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:80px; height:4px; background:linear-gradient(90deg, #667eea, #764ba2); border-radius:2px;"></div>
              </h2>
              <p style="font-size:18px; color:#718096; max-width:600px; margin:0 auto; line-height:1.7;">
                We're not just another company. We're innovators, dreamers, and problem-solvers committed to making a difference in the world through technology and human connection.
              </p>
            </div>

            <!-- Main content grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(350px,1fr)); gap:40px; margin-bottom:60px;">
              <!-- Story Card -->
              <div style="background:rgba(255,255,255,0.9); backdrop-filter:blur(10px); padding:40px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); border:1px solid rgba(255,255,255,0.3); transform:translateY(0); transition:all 0.3s ease;"
                onmouseover="this.style.transform='translateY(-10px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.15)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.1)';">
                <div style="width:60px; height:60px; background:linear-gradient(135deg, #667eea, #764ba2); border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                  <div style="color:white; font-size:24px; font-weight:bold;">🚀</div>
                </div>
                <h3 style="font-size:24px; font-weight:700; margin-bottom:16px; color:#2d3748;">Our Story</h3>
                <p style="font-size:16px; color:#4a5568; line-height:1.7; margin:0;">
                  Founded in 2020 with a vision to bridge the gap between technology and humanity. What started as a small team of passionate individuals has grown into a global force for innovation and positive change.
                </p>
              </div>

              <!-- Mission Card -->
              <div style="background:rgba(255,255,255,0.9); backdrop-filter:blur(10px); padding:40px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); border:1px solid rgba(255,255,255,0.3); transform:translateY(0); transition:all 0.3s ease;"
                onmouseover="this.style.transform='translateY(-10px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.15)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.1)';">
                <div style="width:60px; height:60px; background:linear-gradient(135deg, #48bb78, #38a169); border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                  <div style="color:white; font-size:24px; font-weight:bold;">🎯</div>
                </div>
                <h3 style="font-size:24px; font-weight:700; margin-bottom:16px; color:#2d3748;">Our Mission</h3>
                <p style="font-size:16px; color:#4a5568; line-height:1.7; margin:0;">
                  To empower businesses and individuals with cutting-edge solutions that not only solve complex problems but also create meaningful experiences that inspire and connect people across the globe.
                </p>
              </div>
            </div>

            <!-- Values section -->
            <div style="background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); padding:50px; border-radius:24px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border:1px solid rgba(255,255,255,0.3);">
              <h3 style="font-size:32px; font-weight:700; margin-bottom:40px; color:#2d3748; text-align:center;">What Drives Us</h3>
              
              <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:30px;">
                <div style="text-align:center; padding:20px;">
                  <div style="width:80px; height:80px; background:linear-gradient(135deg, #ed64a6, #d53f8c); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow:0 8px 20px rgba(237,100,166,0.3);">
                    <div style="color:white; font-size:32px;">💡</div>
                  </div>
                  <h4 style="font-size:20px; font-weight:600; margin-bottom:12px; color:#2d3748;">Innovation First</h4>
                  <p style="font-size:14px; color:#718096; line-height:1.6; margin:0;">Constantly pushing boundaries to create solutions that don't just meet needs, but exceed expectations.</p>
                </div>

                <div style="text-align:center; padding:20px;">
                  <div style="width:80px; height:80px; background:linear-gradient(135deg, #4299e1, #3182ce); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow:0 8px 20px rgba(66,153,225,0.3);">
                    <div style="color:white; font-size:32px;">🤝</div>
                  </div>
                  <h4 style="font-size:20px; font-weight:600; margin-bottom:12px; color:#2d3748;">Human Connection</h4>
                  <p style="font-size:14px; color:#718096; line-height:1.6; margin:0;">Building technology that brings people together and creates genuine, meaningful relationships.</p>
                </div>

                <div style="text-align:center; padding:20px;">
                  <div style="width:80px; height:80px; background:linear-gradient(135deg, #48bb78, #38a169); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow:0 8px 20px rgba(72,187,120,0.3);">
                    <div style="color:white; font-size:32px;">🌱</div>
                  </div>
                  <h4 style="font-size:20px; font-weight:600; margin-bottom:12px; color:#2d3748;">Sustainable Growth</h4>
                  <p style="font-size:14px; color:#718096; line-height:1.6; margin:0;">Growing responsibly while making a positive impact on communities and the environment.</p>
                </div>

                <div style="text-align:center; padding:20px;">
                  <div style="width:80px; height:80px; background:linear-gradient(135deg, #ed8936, #dd6b20); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow:0 8px 20px rgba(237,137,54,0.3);">
                    <div style="color:white; font-size:32px;">⚡</div>
                  </div>
                  <h4 style="font-size:20px; font-weight:600; margin-bottom:12px; color:#2d3748;">Excellence</h4>
                  <p style="font-size:14px; color:#718096; line-height:1.6; margin:0;">Delivering the highest quality in everything we do, from code to customer service.</p>
                </div>
              </div>
            </div>

            <!-- CTA section -->
            <div style="text-align:center; margin-top:60px;">
              <p style="font-size:18px; color:#4a5568; margin-bottom:30px;">Ready to be part of our story?</p>
              <button style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; border:none; padding:16px 40px; border-radius:50px; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.3s ease; box-shadow:0 8px 25px rgba(102,126,234,0.3);"
                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(102,126,234,0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(102,126,234,0.3)';">
                Join Our Journey
              </button>
            </div>
          </div>
        </section>
      `;

    default:
      return `<div style="padding:20px; color:#555;">No template found for <strong>${templateSuffix}</strong></div>`;
  }
}

