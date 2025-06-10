// api/builder.js - Page builder functionality
const express = require('express');
const router = express.Router();
const shopifyApi = require('./shopify');
const { PageModel } = require('./database');
// Temporarily comment out to fix startup issue
// const { getAccessToken } = require('./utils/session');

// Get page builder for a specific page
router.get('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Get shop from various possible sources
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Get access token from various possible sources
    const accessToken = req.headers['x-shopify-access-token'] || req.shopifyAccessToken || req.cookies?.shopifyAccessToken;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );
    
    // Allow scripts to run in iframe
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://*.myshopify.com https://*.shopify.com");
    
    console.log(`Loading page builder for page ID: ${pageId} from shop: ${shop}`);
    
    // Try to fetch the real page data from Shopify
    let pageData = null;
    if (shop && accessToken) {
      try {
        const result = await shopifyApi.getShopifyPageById(shop, accessToken, pageId);
        if (result && result.page) {
          pageData = result.page;
          console.log('Successfully fetched page data from Shopify');
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
    
    // Render the page builder HTML
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
          
          <script>
            // Page data from Shopify or database
            window.pageData = ` + pageDataJson + `;
            window.shopOrigin = "` + (shop || '') + `";
            window.pageId = "` + pageId + `";
            
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
          </script>
          
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
                <a href="/dashboard" class="back-btn">← Back to Dashboard</a>
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
                    <p>Section separator</p>
                  </div>
                </div>
              </div>
              
              <div class="widget-category">
                <div class="category-title">Layout</div>
                <div class="widget-item" draggable="true" data-widget="container">
                  <span class="widget-icon">⬜</span>
                  <div class="widget-info">
                    <h4>Container</h4>
                    <p>Content wrapper</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="columns">
                  <span class="widget-icon">⫴</span>
                  <div class="widget-info">
                    <h4>Columns</h4>
                    <p>Multi-column layout</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="spacer">
                  <span class="widget-icon">↕️</span>
                  <div class="widget-info">
                    <h4>Spacer</h4>
                    <p>Vertical spacing</p>
                  </div>
                </div>
              </div>
              
              <div class="widget-category">
                <div class="category-title">Advanced</div>
                <div class="widget-item" draggable="true" data-widget="form">
                  <span class="widget-icon">📝</span>
                  <div class="widget-info">
                    <h4>Form</h4>
                    <p>Input form with fields</p>
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
                  <span class="widget-icon">🎬</span>
                  <div class="widget-info">
                    <h4>Video</h4>
                    <p>Embedded video player</p>
                  </div>
                </div>
                <div class="widget-item" draggable="true" data-widget="map">
                  <span class="widget-icon">🗺️</span>
                  <div class="widget-info">
                    <h4>Map</h4>
                    <p>Google Maps embed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="canvas-area">
              <div class="canvas-toolbar">
                <h1 class="page-title" id="page-title">New Page</h1>
                <div class="toolbar-actions">
                  <span class="status draft" id="page-status">
                    Draft
                  </span>
                  <button class="toolbar-btn" onclick="previewPage()">Preview</button>
                  <button class="toolbar-btn" onclick="savePage(document.getElementById('page-content').innerHTML)">Save</button>
                  <button class="toolbar-btn primary" onclick="publishPage()">Publish</button>
                </div>
              </div>
              
              <div class="canvas-container">
                <div class="canvas" id="canvas">
                  <div class="drop-zone" id="main-drop-zone">
                    <div id="page-content">
                      <p>Start building your page by dragging elements from the left sidebar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right Sidebar - Properties -->
            <div class="properties-sidebar">
              <div class="properties-header">
                <h2>Properties</h2>
              </div>
              <div class="properties-content" id="properties-content">
                <div class="property-group">
                  <h3>Page Settings</h3>
                  <div class="property-row">
                    <label for="page-title-input">Page Title</label>
                    <input type="text" id="page-title-input" value="" onchange="updatePageTitle(this.value)">
                  </div>
                  <div class="property-row">
                    <label for="page-handle-input">URL Handle</label>
                    <input type="text" id="page-handle-input" value="" onchange="updatePageHandle(this.value)">
                  </div>
                </div>
                
                <div class="property-group">
                  <h3>SEO Settings</h3>
                  <div class="property-row">
                    <label for="meta-title-input">Meta Title</label>
                    <input type="text" id="meta-title-input" value="">
                  </div>
                  <div class="property-row">
                    <label for="meta-description-input">Meta Description</label>
                    <textarea id="meta-description-input" rows="3"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            let selectedElement = null;
            let elementCounter = 0;
            
            document.addEventListener('DOMContentLoaded', function() {
              const canvas = document.getElementById('canvas');
              const dropZone = document.getElementById('main-drop-zone');
              const pageContent = document.getElementById('page-content');
              const propertiesContent = document.getElementById('properties-content');
              
              // If page content exists, mark the drop zone as having content
              if (pageContent.innerHTML.trim() !== '') {
                dropZone.classList.add('has-content');
              }
              
              // Drag and Drop functionality
              const widgetItems = document.querySelectorAll('.widget-item');
              widgetItems.forEach(item => {
                item.addEventListener('dragstart', function(e) {
                  e.dataTransfer.setData('text/plain', this.getAttribute('data-widget'));
                });
              });
              
              setupDropZone();
              
              // Update page title when changed
              window.updatePageTitle = function(value) {
                const pageTitleElement = document.getElementById('page-title');
                if (pageTitleElement) {
                  pageTitleElement.textContent = value;
                }
                window.pageData.title = value;
              };
              
              // Update page handle when changed
              window.updatePageHandle = function(value) {
                window.pageData.handle = value;
              };
              
              // Preview page
              window.previewPage = function() {
                const content = document.getElementById('page-content').innerHTML;
                const title = window.pageData.title || 'Preview';
                
                const previewWindow = window.open('', '_blank');
                previewWindow.document.write(
                  '<!DOCTYPE html>' +
                  '<html>' +
                    '<head>' +
                      '<title>' + title + ' - Preview</title>' +
                      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
                      '<style>' +
                        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }' +
                        '.preview-header { background: #f3f4f6; padding: 10px 20px; margin: -20px -20px 20px; border-bottom: 1px solid #e1e3e5; display: flex; justify-content: space-between; align-items: center; }' +
                        '.preview-title { font-size: 16px; font-weight: 600; }' +
                        '.preview-badge { background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }' +
                      '</style>' +
                    '</head>' +
                    '<body>' +
                      '<div class="preview-header">' +
                        '<div class="preview-title">' + title + ' - Preview</div>' +
                        '<div class="preview-badge">Preview Mode</div>' +
                      '</div>' +
                      content +
                    '</body>' +
                  '</html>'
                );
              };
            });
            
            function setupDropZone() {
              const dropZone = document.getElementById('main-drop-zone');
              
              dropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
              });
              
              dropZone.addEventListener('dragleave', function(e) {
                this.classList.remove('drag-over');
              });
              
              dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const widgetType = e.dataTransfer.getData('text/plain');
                if (widgetType) {
                  addWidget(widgetType, this);
                }
              });
            }
            
            function addWidget(widgetType, dropZone) {
              elementCounter++;
              const elementId = `element-${elementCounter}`;
              let widgetHTML = '';
              
              switch (widgetType) {
                case 'heading':
                  widgetHTML = `
                    <div class="widget heading-widget" id="${elementId}" onclick="selectElement(this)">
                      <h2>Heading Text</h2>
                    </div>
                  `;
                  break;
                case 'text':
                  widgetHTML = `
                    <div class="widget text-widget" id="${elementId}" onclick="selectElement(this)">
                      <p>This is a paragraph of text. Click to edit the content and properties.</p>
                    </div>
                  `;
                  break;
                case 'image':
                  widgetHTML = `
                    <div class="widget image-widget" id="${elementId}" onclick="selectElement(this)">
                      <img src="https://via.placeholder.com/800x400" alt="Placeholder Image" style="max-width: 100%;">
                    </div>
                  `;
                  break;
                case 'button':
                  widgetHTML = `
                    <div class="widget button-widget" id="${elementId}" onclick="selectElement(this)">
                      <button style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Click Me</button>
                    </div>
                  `;
                  break;
                case 'divider':
                  widgetHTML = `
                    <div class="widget divider-widget" id="${elementId}" onclick="selectElement(this)">
                      <hr style="border: none; border-top: 1px solid #e1e3e5; margin: 20px 0;">
                    </div>
                  `;
                  break;
                case 'container':
                  widgetHTML = `
                    <div class="widget container-widget" id="${elementId}" onclick="selectElement(this)" style="border: 1px dashed #e1e3e5; padding: 20px; border-radius: 4px;">
                      <div class="container-content">Drop elements here</div>
                    </div>
                  `;
                  break;
                case 'columns':
                  widgetHTML = `
                    <div class="widget columns-widget" id="${elementId}" onclick="selectElement(this)" style="display: flex; gap: 20px;">
                      <div style="flex: 1; border: 1px dashed #e1e3e5; padding: 20px; border-radius: 4px;">Column 1</div>
                      <div style="flex: 1; border: 1px dashed #e1e3e5; padding: 20px; border-radius: 4px;">Column 2</div>
                    </div>
                  `;
                  break;
                default:
                  widgetHTML = `
                    <div class="widget generic-widget" id="${elementId}" onclick="selectElement(this)">
                      <p>${widgetType} widget</p>
                    </div>
                  `;
              }
              
              dropZone.classList.add('has-content');
              
              // If this is the first widget, clear the placeholder text
              if (dropZone.querySelector('p') && dropZone.querySelectorAll('div').length === 0) {
                dropZone.innerHTML = '';
              }
              
              const pageContent = document.getElementById('page-content');
              pageContent.insertAdjacentHTML('beforeend', widgetHTML);
              
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
              
              // Stop event propagation
              event.stopPropagation();
            }
            
            function updatePropertiesPanel(element) {
              const propertiesContent = document.getElementById('properties-content');
              const elementType = element.className.split(' ')[1];
              
              let propertiesHTML = '';
              
              switch (elementType) {
                case 'heading-widget':
                  const headingText = element.querySelector('h2').textContent;
                  propertiesHTML = `
                    <div class="property-group">
                      <h3>Heading Properties</h3>
                      <div class="property-row">
                        <label for="heading-text">Text</label>
                        <input type="text" id="heading-text" value="${headingText}" onchange="updateElementProperty('text', this.value)">
                      </div>
                      <div class="property-row">
                        <label for="heading-size">Size</label>
                        <select id="heading-size" onchange="updateElementProperty('size', this.value)">
                          <option value="h1">H1 - Large</option>
                          <option value="h2" selected>H2 - Medium</option>
                          <option value="h3">H3 - Small</option>
                        </select>
                      </div>
                      <div class="property-row">
                        <label for="heading-align">Alignment</label>
                        <select id="heading-align" onchange="updateElementProperty('align', this.value)">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                    <div class="property-group">
                      <h3>Actions</h3>
                      <button onclick="deleteElement()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Delete Element</button>
                    </div>
                  `;
                  break;
                  
                case 'text-widget':
                  const paragraphText = element.querySelector('p').textContent;
                  propertiesHTML = `
                    <div class="property-group">
                      <h3>Text Properties</h3>
                      <div class="property-row">
                        <label for="text-content">Content</label>
                        <textarea id="text-content" rows="4" onchange="updateElementProperty('text', this.value)">${paragraphText}</textarea>
                      </div>
                      <div class="property-row">
                        <label for="text-align">Alignment</label>
                        <select id="text-align" onchange="updateElementProperty('align', this.value)">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                          <option value="justify">Justify</option>
                        </select>
                      </div>
                    </div>
                    <div class="property-group">
                      <h3>Actions</h3>
                      <button onclick="deleteElement()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Delete Element</button>
                    </div>
                  `;
                  break;
                  
                default:
                  propertiesHTML = `
                    <div class="property-group">
                      <h3>${elementType.split('-')[0].charAt(0).toUpperCase() + elementType.split('-')[0].slice(1)} Properties</h3>
                      <p>Select an element to edit its properties.</p>
                    </div>
                    <div class="property-group">
                      <h3>Actions</h3>
                      <button onclick="deleteElement()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Delete Element</button>
                    </div>
                  `;
              }
              
              propertiesContent.innerHTML = propertiesHTML;
            }
            
            function updateElementProperty(property, value) {
              if (!selectedElement) return;
              
              const elementType = selectedElement.className.split(' ')[1];
              
              switch (elementType) {
                case 'heading-widget':
                  if (property === 'text') {
                    selectedElement.querySelector('h2').textContent = value;
                  } else if (property === 'size') {
                    const headingText = selectedElement.querySelector('h2').textContent;
                    selectedElement.innerHTML = `<${value}>${headingText}</${value}>`;
                  } else if (property === 'align') {
                    selectedElement.style.textAlign = value;
                  }
                  break;
                  
                case 'text-widget':
                  if (property === 'text') {
                    selectedElement.querySelector('p').textContent = value;
                  } else if (property === 'align') {
                    selectedElement.style.textAlign = value;
                  }
                  break;
              }
            }
            
            function deleteElement() {
              if (!selectedElement) return;
              
              // Ask for confirmation
              if (confirm('Are you sure you want to delete this element?')) {
                selectedElement.remove();
                selectedElement = null;
                
                // Reset properties panel
                const propertiesContent = document.getElementById('properties-content');
                propertiesContent.innerHTML = `
                  <div class="property-group">
                    <h3>Page Properties</h3>
                    <p>Select an element to edit its properties.</p>
                  </div>
                `;
                
                // Check if canvas is empty
                const pageContent = document.getElementById('page-content');
                if (pageContent.children.length === 0) {
                  pageContent.innerHTML = '<p>Start building your page by dragging elements from the left sidebar.</p>';
                  document.getElementById('main-drop-zone').classList.remove('has-content');
                }
              }
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering page builder:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; text-align: center; }
            .error-container { max-width: 600px; margin: 0 auto; }
            h1 { color: #ef4444; }
            .error-message { background: #fee2e2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
            .back-btn { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Error Loading Page Builder</h1>
            <p>There was an error loading the page builder. Please try again or contact support if the problem persists.</p>
            <div class="error-message">
              <strong>Error:</strong> ${error.message}
            </div>
            <a href="/dashboard" class="back-btn">Back to Dashboard</a>
          </div>
        </body>
      </html>
    `);
  }
});

module.exports = router;