// api/builder.js - Page builder functionality
const express = require('express');
const router = express.Router();
const shopifyApi = require('./shopify');
const { PageModel } = require('./database');

// Get page builder for a specific page
router.get('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Get shop from various possible sources
    let shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Get access token from various possible sources
    let accessToken = req.headers['x-shopify-access-token'] || req.shopifyAccessToken || req.cookies?.shopifyAccessToken;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );
    
    // Allow scripts to run in iframe
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://*.myshopify.com https://*.shopify.com");
    
    console.log(`Loading page builder for page ID: ${pageId} from shop: ${shop}`);
    
    // Try to fetch the real page data from Shopify API using our new bridge
    let pageData = null;
    if (shop && accessToken) {
      try {
        // First try using our new shopify-bridge API
        const apiResult = await fetch(`/api/shopify/pages/${pageId}`, {
          headers: {
            'X-Shopify-Shop-Domain': shop,
            'X-Shopify-Access-Token': accessToken
          }
        });
        
        if (apiResult.ok) {
          const data = await apiResult.json();
          if (data.success && data.page) {
            pageData = data.page;
            console.log('Successfully fetched page data from Shopify via API bridge');
          }
        } else {
          console.log('Failed to fetch from API bridge, falling back to direct method');
        }
        
        // Fallback to direct method if bridge fails
        if (!pageData) {
          const result = await shopifyApi.getShopifyPageById(shop, accessToken, pageId);
          if (result && result.page) {
            pageData = result.page;
            console.log('Successfully fetched page data from Shopify via direct API');
          }
        }
      } catch (error) {
        console.error('Error fetching page from Shopify:', error.message);
        // Continue with database or default data
      }
    } else {
      console.log('No shop or access token available, will use database or default data');
    }
    
    // If no data from Shopify API, try to get from database
    if (!pageData && shop) {
      try {
        const dbPage = await PageModel.findOne(shop, pageId);
        if (dbPage) {
          pageData = dbPage;
          console.log('Successfully fetched page data from database');
        }
      } catch (dbError) {
        console.error('Error fetching page from database:', dbError.message);
      }
    }
    
    // If still no page data, create default data
    if (!pageData) {
      pageData = {
        id: pageId,
        title: 'New Page',
        handle: `page-${pageId}`,
        body_html: '<div>This is a new page. Start building!</div>',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published: false
      };
      console.log('Using default page data');
    }
    
    // Prepare page data for the frontend
    const pageDataJson = JSON.stringify(pageData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
    
    // Render the page builder HTML - FIXED TEMPLATE LITERAL ISSUE
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Page Builder</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          <meta http-equiv="X-Frame-Options" content="ALLOW-FROM https://*.myshopify.com https://*.shopify.com">
          
          <!-- Styles -->
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .builder-layout { display: flex; height: 100vh; }
            
            /* Left Sidebar - Widgets */
            .widgets-sidebar { width: 320px; background: #1e1e2e; color: white; border-right: 1px solid #333; overflow-y: auto; }
            .sidebar-header { padding: 20px; border-bottom: 1px solid #333; background: #2a2a3a; }
            .sidebar-header h2 { margin: 0; font-size: 18px; font-weight: 600; color: #fff; }
            .back-btn { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; text-decoration: none; display: inline-block; margin-bottom: 15px; }
            
            .widget-category { margin-bottom: 20px; }
            .category-title { padding: 15px 20px 10px; font-weight: 600; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            
            .widget-item { display: flex; align-items: center; padding: 12px 20px; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; border-radius: 0 8px 8px 0; margin: 2px 0; }
            .widget-item:hover { background: #2a2a3a; border-left-color: #6366f1; }
            .widget-icon { margin-right: 12px; font-size: 18px; }
            .widget-info h4 { margin: 0 0 2px 0; font-size: 14px; font-weight: 500; color: #fff; }
            .widget-info p { margin: 0; font-size: 12px; color: #a1a1aa; }
            
            /* Main Content Area */
            .canvas-area { flex: 1; display: flex; flex-direction: column; }
            .canvas-toolbar { background: white; padding: 15px 20px; border-bottom: 1px solid #e1e3e5; display: flex; justify-content: space-between; align-items: center; }
            .page-title { font-size: 18px; font-weight: 600; margin: 0; }
            .toolbar-actions { display: flex; gap: 10px; }
            .toolbar-btn { background: #f3f4f6; border: 1px solid #e1e3e5; color: #374151; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; }
            .toolbar-btn.primary { background: #6366f1; border-color: #6366f1; color: white; }
            .toolbar-btn:hover { background: #e5e7eb; }
            .toolbar-btn.primary:hover { background: #4f46e5; }
            
            .canvas-container { flex: 1; padding: 20px; overflow-y: auto; }
            .canvas { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 500px; }
            
            .drop-zone { padding: 30px; min-height: 300px; border: 2px dashed #e1e3e5; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; }
            .drop-zone.drag-over { background: #f3f4f6; border-color: #6366f1; }
            .drop-zone.has-content { border-style: solid; border-color: #e1e3e5; padding: 0; }
            .drop-zone p { color: #6b7280; font-size: 16px; text-align: center; }
            
            /* Right Sidebar - Properties */
            .properties-sidebar { width: 320px; background: white; border-left: 1px solid #e1e3e5; overflow-y: auto; }
            .properties-header { padding: 20px; border-bottom: 1px solid #e1e3e5; }
            .properties-header h2 { margin: 0; font-size: 18px; font-weight: 600; color: #111827; }
            .properties-content { padding: 20px; }
            
            .property-group { margin-bottom: 24px; }
            .property-group h3 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151; }
            .property-row { margin-bottom: 16px; }
            .property-row label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 500; color: #6b7280; }
            .property-row input, .property-row select, .property-row textarea { width: 100%; padding: 8px 12px; border: 1px solid #e1e3e5; border-radius: 6px; font-size: 14px; }
            .property-row input:focus, .property-row select:focus, .property-row textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
            
            /* Widget Elements */
            .widget-element { position: relative; padding: 20px; margin: 10px 0; border: 1px solid #e1e3e5; border-radius: 6px; }
            .widget-element:hover { border-color: #6366f1; }
            .widget-element.selected { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
            
            .heading-widget h2 { margin: 0; color: #111827; }
            
            .text-widget p { margin: 0; color: #374151; }
            
            .image-widget { text-align: center; }
            .image-widget img { max-width: 100%; height: auto; border-radius: 4px; }
            .image-widget .placeholder { width: 100%; height: 200px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6b7280; }
            
            .button-widget { text-align: center; }
            .button-widget button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
            
            .divider-widget hr { border: none; height: 1px; background: #e1e3e5; margin: 10px 0; }
            
            .embed-widget { text-align: center; }
            .embed-widget iframe { width: 100%; border: none; border-radius: 4px; }
            .embed-widget .placeholder { width: 100%; height: 200px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6b7280; }
            
            /* Notification */
            .notification { position: fixed; bottom: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; background: #1e1e2e; color: white; transform: translateY(100px); opacity: 0; transition: all 0.3s; z-index: 1000; }
            .notification.show { transform: translateY(0); opacity: 1; }
            .notification.success { background: #10b981; }
            .notification.error { background: #ef4444; }
            .notification.info { background: #3b82f6; }

            /* Responsive */
            @media (max-width: 1200px) {
              .properties-sidebar { width: 280px; }
              .widgets-sidebar { width: 280px; }
            }
            
            @media (max-width: 992px) {
              .builder-layout { flex-direction: column; }
              .widgets-sidebar, .properties-sidebar { width: 100%; height: 300px; }
              .canvas-area { height: 400px; }
            }
          </style>
        </head>
        <body>
          <div class="builder-layout">
            <!-- Left Sidebar - Widgets -->
            <div class="widgets-sidebar">
              <div class="sidebar-header">
                <a href="/app?shop=${shop}" class="back-btn">← Back to Dashboard</a>
                <h2>Elements</h2>
              </div>
              
              <div class="widget-category">
                <div class="category-title">Basic</div>
                <div class="widget-item" draggable="true" data-widget="heading">
                  <span class="widget-icon">H</span>
                  <div class="widget-info">
                    <h4>Heading</h4>
                    <p>Section title text</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="text">
                  <span class="widget-icon">¶</span>
                  <div class="widget-info">
                    <h4>Text</h4>
                    <p>Paragraph text block</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="image">
                  <span class="widget-icon">🖼️</span>
                  <div class="widget-info">
                    <h4>Image</h4>
                    <p>Picture or graphic</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="button">
                  <span class="widget-icon">🔘</span>
                  <div class="widget-info">
                    <h4>Button</h4>
                    <p>Call to action button</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="divider">
                  <span class="widget-icon">—</span>
                  <div class="widget-info">
                    <h4>Divider</h4>
                    <p>Horizontal separator line</p>
                  </div>
                </div>
              </div>
              
              <div class="widget-category">
                <div class="category-title">Advanced</div>
                <div class="widget-item" draggable="true" data-widget="form">
                  <span class="widget-icon">📝</span>
                  <div class="widget-info">
                    <h4>Form</h4>
                    <p>Contact or newsletter form</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="gallery">
                  <span class="widget-icon">🖼️</span>
                  <div class="widget-info">
                    <h4>Gallery</h4>
                    <p>Image collection</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="video">
                  <span class="widget-icon">🎥</span>
                  <div class="widget-info">
                    <h4>Video</h4>
                    <p>Embed YouTube or Vimeo</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="social">
                  <span class="widget-icon">👥</span>
                  <div class="widget-info">
                    <h4>Social Media</h4>
                    <p>Share buttons and feeds</p>
                  </div>
                </div>
              </div>
              
              <div class="widget-category">
                <div class="category-title">Shopify</div>
                <div class="widget-item" draggable="true" data-widget="product">
                  <span class="widget-icon">🛒</span>
                  <div class="widget-info">
                    <h4>Product</h4>
                    <p>Single product display</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="collection">
                  <span class="widget-icon">📦</span>
                  <div class="widget-info">
                    <h4>Collection</h4>
                    <p>Product collection grid</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="featured">
                  <span class="widget-icon">⭐</span>
                  <div class="widget-info">
                    <h4>Featured Products</h4>
                    <p>Showcase best products</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="canvas-area">
              <div class="canvas-toolbar">
                <h1 class="page-title">${pageData.title || 'New Page'}</h1>
                <div class="toolbar-actions">
                  <button class="toolbar-btn" onclick="window.location.href='/app/pages?shop=${shop}'">Cancel</button>
                  <button class="toolbar-btn" onclick="savePageContent()">Save</button>
                  <button class="toolbar-btn primary" onclick="publishPageContent()">Publish</button>
                </div>
              </div>
              
              <div class="canvas-container">
                <div class="canvas">
                  <div id="drop-zone" class="drop-zone">
                    <p>Drag and drop elements here to build your page</p>
                    <p>or</p>
                    <button class="toolbar-btn" onclick="addDefaultContent()">Add Sample Content</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right Sidebar - Properties -->
            <div class="properties-sidebar">
              <div class="properties-header">
                <h2>Properties</h2>
              </div>
              <div id="properties-content" class="properties-content">
                <div class="property-group">
                  <h3>Page Properties</h3>
                  <div class="property-row">
                    <label for="page-title">Page Title</label>
                    <input type="text" id="page-title" value="${pageData.title || 'New Page'}" onchange="updatePageTitle(this.value)">
                  </div>
                  <div class="property-row">
                    <label for="page-handle">Page Handle (URL)</label>
                    <input type="text" id="page-handle" value="${pageData.handle || ''}" onchange="updatePageHandle(this.value)">
                    <p style="margin-top: 4px; font-size: 12px; color: #6b7280;">Example: about-us, contact-page</p>
                  </div>
                </div>
                <div class="property-group">
                  <h3>Element Properties</h3>
                  <p>Select an element to edit its properties.</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Page Builder Scripts -->
          <script>
            // Page data from Shopify or database
            window.pageData = ${pageDataJson};
            window.shopOrigin = "${shop || ''}";
            window.pageId = "${pageId}";
            
            // Variables
            let selectedElement = null;
            let draggedWidget = null;
            
            // Initialize page builder
            document.addEventListener('DOMContentLoaded', function() {
              initPageBuilder();
            });
            
            // Function to save page content back to Shopify
            async function savePage(content) {
              try {
                const response = await fetch('/api/pages/' + window.pageId, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Shop-Domain': window.shopOrigin
                  },
                  body: JSON.stringify({
                    content: content,
                    title: window.pageData.title,
                    handle: window.pageData.handle
                  })
                });
                
                const result = await response.json();
                if (result.success) {
                  showNotification('Page saved successfully!', 'success');
                  return true;
                } else {
                  showNotification('Error saving page: ' + result.message, 'error');
                  return false;
                }
              } catch (error) {
                console.error('Error saving page:', error);
                showNotification('Failed to save page. Please try again.', 'error');
                return false;
              }
            }
            
            // Function to publish page to Shopify
            async function publishPage() {
              try {
                const response = await fetch('/api/pages/' + window.pageId, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Shop-Domain': window.shopOrigin
                  },
                  body: JSON.stringify({
                    published: true
                  })
                });
                
                const result = await response.json();
                if (result.success) {
                  showNotification('Page published successfully!', 'success');
                  return true;
                } else {
                  showNotification('Error publishing page: ' + result.message, 'error');
                  return false;
                }
              } catch (error) {
                console.error('Error publishing page:', error);
                showNotification('Failed to publish page. Please try again.', 'error');
                return false;
              }
            }
            
            // Show notification
            function showNotification(message, type = 'info') {
              const notification = document.createElement('div');
              notification.className = 'notification ' + type;
              notification.textContent = message;
              
              document.body.appendChild(notification);
              
              setTimeout(() => {
                notification.classList.add('show');
              }, 10);
              
              setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                  notification.remove();
                }, 300);
              }, 3000);
            }
            
            function initPageBuilder() {
              // Initialize drag and drop functionality
              initDragAndDrop();
              
              // Parse existing page content if available
              parseExistingContent();
              
              // Add click handlers to canvas to deselect elements
              document.querySelector('.canvas').addEventListener('click', function(event) {
                if (event.target === this || event.target.classList.contains('drop-zone')) {
                  deselectAllElements();
                  updatePropertiesPanel(null);
                }
              });
            }
            
            function initDragAndDrop() {
              const dropZone = document.getElementById('drop-zone');
              const widgetItems = document.querySelectorAll('.widget-item');
              
              // Make widgets draggable
              widgetItems.forEach(widget => {
                widget.addEventListener('dragstart', function(event) {
                  draggedWidget = this.getAttribute('data-widget');
                  event.dataTransfer.setData('text/plain', draggedWidget);
                  event.dataTransfer.effectAllowed = 'copy';
                });
              });
              
              // Setup drop zone
              dropZone.addEventListener('dragover', function(event) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                this.classList.add('drag-over');
              });
              
              dropZone.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
              });
              
              dropZone.addEventListener('drop', function(event) {
                event.preventDefault();
                this.classList.remove('drag-over');
                
                const widgetType = event.dataTransfer.getData('text/plain') || draggedWidget;
                if (widgetType) {
                  addWidget(widgetType, this);
                }
              });
            }
            
            function parseExistingContent() {
              const dropZone = document.getElementById('drop-zone');
              const existingHtml = window.pageData.body_html;
              
              if (existingHtml && existingHtml.trim() !== '') {
                // If there's existing content, set it to the drop zone
                dropZone.innerHTML = existingHtml;
                dropZone.classList.add('has-content');
                
                // Make existing elements selectable
                initExistingElements();
              }
            }
            
            function initExistingElements() {
              const elements = document.querySelectorAll('.widget-element');
              
              elements.forEach(element => {
                element.addEventListener('click', function(event) {
                  selectElement(this);
                  event.stopPropagation();
                });
              });
            }
            
            function addWidget(widgetType, dropZone) {
              // Generate a unique ID for the element
              const elementId = 'element-' + Date.now();
              
              // Check if this is the first element
              const isFirstElement = !dropZone.classList.contains('has-content');
              
              // Clear placeholder content if this is the first element
              if (isFirstElement) {
                dropZone.innerHTML = '';
                dropZone.classList.add('has-content');
              }
              
              // Create element HTML based on widget type
              let elementHTML = '';
              
              switch (widgetType) {
                case 'heading':
                  elementHTML = '<div id="' + elementId + '" class="widget-element heading-widget"><h2>Your Heading Here</h2></div>';
                  break;
                case 'text':
                  elementHTML = '<div id="' + elementId + '" class="widget-element text-widget"><p>This is a paragraph of text. Click to edit this text and add your own content.</p></div>';
                  break;
                case 'image':
                  elementHTML = '<div id="' + elementId + '" class="widget-element image-widget"><div class="placeholder">Click to add an image</div></div>';
                  break;
                case 'button':
                  elementHTML = '<div id="' + elementId + '" class="widget-element button-widget"><button>Click Me</button></div>';
                  break;
                case 'divider':
                  elementHTML = '<div id="' + elementId + '" class="widget-element divider-widget"><hr></div>';
                  break;
                case 'form':
                  elementHTML = '<div id="' + elementId + '" class="widget-element form-widget"><h3>Contact Form</h3><form><div style="margin-bottom:15px"><label style="display:block;margin-bottom:5px">Name</label><input type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"></div><div style="margin-bottom:15px"><label style="display:block;margin-bottom:5px">Email</label><input type="email" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"></div><div style="margin-bottom:15px"><label style="display:block;margin-bottom:5px">Message</label><textarea style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;height:100px"></textarea></div><button type="button" style="background:#6366f1;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer">Submit</button></form></div>';
                  break;
                case 'video':
                  elementHTML = '<div id="' + elementId + '" class="widget-element video-widget"><div class="placeholder">Click to add a video</div></div>';
                  break;
                case 'product':
                  elementHTML = '<div id="' + elementId + '" class="widget-element product-widget"><div style="border:1px solid #ddd;border-radius:8px;padding:20px;text-align:center"><div style="width:100%;height:200px;background:#f6f6f7;border-radius:4px;margin-bottom:15px;display:flex;align-items:center;justify-content:center;color:#6b7280">Product Image</div><h3 style="margin:0 0 10px 0">Product Title</h3><p style="margin:0 0 15px 0;color:#6b7280">$19.99</p><button style="background:#6366f1;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer">Add to Cart</button></div></div>';
                  break;
                case 'collection':
                  elementHTML = '<div id="' + elementId + '" class="widget-element collection-widget"><h3>Product Collection</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">' + 
                  Array(3).fill('<div style="border:1px solid #ddd;border-radius:8px;padding:10px;text-align:center"><div style="width:100%;height:120px;background:#f6f6f7;border-radius:4px;margin-bottom:10px"></div><h4 style="margin:0 0 5px 0;font-size:14px">Product Name</h4><p style="margin:0;color:#6b7280;font-size:14px">$19.99</p></div>').join('') + 
                  '</div></div>';
                  break;
                case 'gallery':
                  elementHTML = '<div id="' + elementId + '" class="widget-element gallery-widget"><h3>Image Gallery</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' + 
                  Array(6).fill('<div style="width:100%;height:100px;background:#f6f6f7;border-radius:4px"></div>').join('') + 
                  '</div></div>';
                  break;
                default:
                  elementHTML = '<div id="' + elementId + '" class="widget-element"><p>Unknown widget type: ' + widgetType + '</p></div>';
              }
              
              // Add the element to the drop zone
              dropZone.insertAdjacentHTML('beforeend', elementHTML);
              
              // Make the new element selectable
              const newElement = document.getElementById(elementId);
              newElement.addEventListener('click', function(event) {
                selectElement(this);
                event.stopPropagation();
              });
              
              // Select the newly added element
              selectElement(document.getElementById(elementId));
            }
            
            function selectElement(element) {
              // Deselect previously selected element
              if (selectedElement) {
                selectedElement.classList.remove('selected');
              }
              
              // Select new element
              selectedElement = element;
              selectedElement.classList.add('selected');
              
              // Update properties panel
              updatePropertiesPanel(element);
            }
            
            function updatePropertiesPanel(element) {
              const propertiesContent = document.getElementById('properties-content');
              
              if (!element) {
                // Show page properties if no element is selected
                propertiesContent.innerHTML = '<div class="property-group">' +
                  '<h3>Page Properties</h3>' +
                  '<div class="property-row">' +
                  '<label for="page-title">Page Title</label>' +
                  '<input type="text" id="page-title" value="' + (window.pageData.title || 'New Page') + '" onchange="updatePageTitle(this.value)">' +
                  '</div>' +
                  '<div class="property-row">' +
                  '<label for="page-handle">Page Handle (URL)</label>' +
                  '<input type="text" id="page-handle" value="' + (window.pageData.handle || '') + '" onchange="updatePageHandle(this.value)">' +
                  '<p style="margin-top: 4px; font-size: 12px; color: #6b7280;">Example: about-us, contact-page</p>' +
                  '</div>' +
                  '</div>' +
                  '<div class="property-group">' +
                  '<h3>Element Properties</h3>' +
                  '<p>Select an element to edit its properties.</p>' +
                  '</div>';
                return;
              }
              
              // Get element type
              const elementType = Array.from(element.classList)
                .find(cls => cls.endsWith('-widget'))
                ?.replace('-widget', '') || 'unknown';
              
              let propertiesHTML = '';
              
              switch (elementType) {
                case 'heading':
                  const headingText = element.querySelector('h2').textContent;
                  propertiesHTML = '<div class="property-group">' +
                    '<h3>Heading Properties</h3>' +
                    '<div class="property-row">' +
                    '<label for="heading-text">Text</label>' +
                    '<input type="text" id="heading-text" value="' + headingText + '" onchange="updateElementProperty(\'text\', this.value)">' +
                    '</div>' +
                    '<div class="property-row">' +
                    '<label for="heading-size">Size</label>' +
                    '<select id="heading-size" onchange="updateElementProperty(\'size\', this.value)">' +
                    '<option value="h1">H1 - Large</option>' +
                    '<option value="h2" selected>H2 - Medium</option>' +
                    '<option value="h3">H3 - Small</option>' +
                    '</select>' +
                    '</div>' +
                    '<div class="property-row">' +
                    '<label for="heading-align">Alignment</label>' +
                    '<select id="heading-align" onchange="updateElementProperty(\'align\', this.value)">' +
                    '<option value="left">Left</option>' +
                    '<option value="center">Center</option>' +
                    '<option value="right">Right</option>' +
                    '</select>' +
                    '</div>' +
                    '</div>' +
                    '<div class="property-group">' +
                    '<h3>Actions</h3>' +
                    '<button onclick="deleteElement()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Delete Element</button>' +
                    '</div>';
                  break;
                  
                case 'text':
                  const paragraphText = element.querySelector('p').textContent;
                  propertiesHTML = '<div class="property-group">' +
                    '<h3>Text Properties</h3>' +
                    '<div class="property-row">' +
                    '<label for="text-content">Content</label>' +
                    '<textarea id="text-content" rows="4" onchange="updateElementProperty(\'text\', this.value)">' + paragraphText + '</textarea>' +
                    '</div>' +
                    '<div class="property-row">' +
                    '<label for="text-align">Alignment</label>' +
                    '<select id="text-align" onchange="updateElementProperty(\'align\', this.value)">' +
                    '<option value="left">Left</option>' +
                    '<option value="center">Center</option>' +
                    '<option value="right">Right</option>' +
                    '<option value="justify">Justify</option>' +
                    '</select>' +
                    '</div>' +
                    '</div>' +
                    '<div class="property-group">' +
                    '<h3>Actions</h3>' +
                    '<button onclick="deleteElement()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Delete Element</button>' +
                    '</div>';
                  break;
                  
                default:
                  // Generic properties for other element types
                  propertiesHTML = '<div class="property-group">' +
                    '<h3>' + (elementType.charAt(0).toUpperCase() + elementType.slice(1)) + ' Properties</h3>' +
                    '<p>Edit the properties for this element:</p>' +
                    '<div class="property-row">' +
                    '<label for="element-id">Element ID</label>' +
                    '<input type="text" id="element-id" value="' + element.id + '" disabled>' +
                    '</div>' +
                    '</div>' +
                    '<div class="property-group">' +
                    '<h3>Actions</h3>' +
                    '<button onclick="deleteElement()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Delete Element</button>' +
                    '</div>';
              }
              
              propertiesContent.innerHTML = propertiesHTML;
            }
            
            function updateElementProperty(property, value) {
              if (!selectedElement) return;
              
              const elementType = Array.from(selectedElement.classList)
                .find(cls => cls.endsWith('-widget'))
                ?.replace('-widget', '') || 'unknown';
              
              switch (elementType) {
                case 'heading':
                  if (property === 'text') {
                    selectedElement.querySelector('h2').textContent = value;
                  } else if (property === 'size') {
                    const currentHeading = selectedElement.querySelector('h1, h2, h3, h4, h5, h6');
                    const newHeading = document.createElement(value);
                    newHeading.textContent = currentHeading.textContent;
                    currentHeading.replaceWith(newHeading);
                  } else if (property === 'align') {
                    selectedElement.style.textAlign = value;
                  }
                  break;
                  
                case 'text':
                  if (property === 'text') {
                    selectedElement.querySelector('p').textContent = value;
                  } else if (property === 'align') {
                    selectedElement.style.textAlign = value;
                  }
                  break;
              }
            }
            
            function deleteElement() {
              if (selectedElement) {
                // Check if this is the last element
                const parent = selectedElement.parentNode;
                selectedElement.remove();
                
                // If no more elements, show the empty state
                if (parent.children.length === 0) {
                  parent.innerHTML = '<p>Drag and drop elements here to build your page</p><p>or</p><button class="toolbar-btn" onclick="addDefaultContent()">Add Sample Content</button>';
                  parent.classList.remove('has-content');
                }
                
                // Reset selected element
                selectedElement = null;
                
                // Update properties panel
                updatePropertiesPanel(null);
              }
            }
            
            function deselectAllElements() {
              if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
              }
            }
            
            function updatePageTitle(title) {
              window.pageData.title = title;
              document.querySelector('.page-title').textContent = title;
            }
            
            function updatePageHandle(handle) {
              window.pageData.handle = handle;
            }
            
            function addDefaultContent() {
              const dropZone = document.getElementById('drop-zone');
              
              // Clear any existing content
              dropZone.innerHTML = '';
              dropZone.classList.add('has-content');
              
              // Add sample content
              const content = '<div id="element-heading-1" class="widget-element heading-widget">' +
                '<h2>Welcome to Our Page</h2>' +
                '</div>' +
                '<div id="element-text-1" class="widget-element text-widget">' +
                '<p>This is a sample page created with KingsBuilder. You can edit this content or add your own by dragging elements from the sidebar.</p>' +
                '</div>' +
                '<div id="element-image-1" class="widget-element image-widget">' +
                '<div class="placeholder">Click to add an image</div>' +
                '</div>' +
                '<div id="element-button-1" class="widget-element button-widget">' +
                '<button>Learn More</button>' +
                '</div>';
              
              dropZone.innerHTML = content;
              
              // Make the elements selectable
              initExistingElements();
            }
            
            function savePageContent() {
              const dropZone = document.getElementById('drop-zone');
              const content = dropZone.innerHTML;
              
              savePage(content)
                .then(success => {
                  if (success) {
                    window.pageData.body_html = content;
                  }
                });
            }
            
            function publishPageContent() {
              savePageContent();
              publishPage();
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering page builder:', error);
    res.status(500).send('An error occurred while loading the page builder. Please try again.');
  }
});

module.exports = router;