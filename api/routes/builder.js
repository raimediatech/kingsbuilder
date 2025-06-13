// api/routes/builder.js - Builder routes
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Builder page route
router.get('/:pageId', (req, res) => {
  try {
    const { pageId } = req.params;
    const shop = req.query.shop || req.cookies?.shopOrigin;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://cdnjs.cloudflare.com;"
    );
    
    // Remove X-Frame-Options as it's deprecated and causing issues
    res.removeHeader('X-Frame-Options');
    
    if (!shop) {
      return res.status(400).send('Shop parameter is required');
    }

    // Send the builder HTML
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder - Page Builder</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          :root {
            --primary-color: #000000;
            --primary-hover: #333333;
            --text-color: #333333;
            --bg-color: #ffffff;
            --card-bg: #f9f9f9;
            --border-color: #e5e5e5;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .builder-header {
            background-color: #000;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .builder-title {
            font-size: 18px;
            font-weight: 600;
          }

          .builder-actions {
            display: flex;
            gap: 10px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            text-decoration: none;
          }

          .btn:hover {
            background-color: #444;
          }

          .btn-primary {
            background-color: #fff;
            color: #000;
          }

          .btn-primary:hover {
            background-color: #f0f0f0;
          }

          .btn i {
            margin-right: 6px;
          }

          .builder-container {
            display: flex;
            flex: 1;
            overflow: hidden;
          }

          .sidebar {
            width: 300px;
            background-color: #f5f5f5;
            border-right: 1px solid #ddd;
            overflow-y: auto;
            padding: 20px;
          }

          .sidebar-section {
            margin-bottom: 20px;
          }

          .sidebar-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
          }

          .element-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .element-item {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .element-item:hover {
            border-color: #000;
            transform: translateY(-2px);
          }

          .element-item i {
            font-size: 20px;
            margin-bottom: 5px;
            display: block;
          }

          .element-item span {
            font-size: 12px;
            display: block;
          }

          .canvas {
            flex: 1;
            background-color: #fff;
            overflow-y: auto;
            padding: 20px;
            position: relative;
          }

          .canvas-content {
            min-height: 100%;
            border: 1px dashed #ddd;
            padding: 20px;
            position: relative;
          }

          .placeholder {
            text-align: center;
            padding: 40px;
            color: #999;
          }

          .placeholder i {
            font-size: 48px;
            margin-bottom: 10px;
          }

          .placeholder h3 {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .placeholder p {
            font-size: 14px;
          }

          .properties-panel {
            width: 300px;
            background-color: #f5f5f5;
            border-left: 1px solid #ddd;
            overflow-y: auto;
            padding: 20px;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 5px;
          }

          .form-control {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }

          .form-control:focus {
            border-color: #000;
            outline: none;
          }

          .color-picker {
            display: flex;
            gap: 5px;
          }

          .color-option {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid transparent;
          }

          .color-option.active {
            border-color: #000;
          }

          .loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #000;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="builder-header">
          <div class="builder-title">
            <i class="fas fa-edit"></i> Page Builder
          </div>
          <div class="builder-actions">
            <button class="btn" id="preview-btn">
              <i class="fas fa-eye"></i> Preview
            </button>
            <button class="btn" id="save-btn">
              <i class="fas fa-save"></i> Save
            </button>
            <a href="/dashboard?shop=${shop}" class="btn">
              <i class="fas fa-times"></i> Exit
            </a>
            <button class="btn btn-primary" id="publish-btn">
              <i class="fas fa-globe"></i> Publish
            </button>
          </div>
        </div>

        <div class="builder-container">
          <div class="sidebar">
            <div class="sidebar-section">
              <h3 class="sidebar-title">Elements</h3>
              <div class="element-list">
                <div class="element-item" draggable="true" data-type="heading">
                  <i class="fas fa-heading"></i>
                  <span>Heading</span>
                </div>
                <div class="element-item" draggable="true" data-type="text">
                  <i class="fas fa-font"></i>
                  <span>Text</span>
                </div>
                <div class="element-item" draggable="true" data-type="image">
                  <i class="fas fa-image"></i>
                  <span>Image</span>
                </div>
                <div class="element-item" draggable="true" data-type="button">
                  <i class="fas fa-square"></i>
                  <span>Button</span>
                </div>
                <div class="element-item" draggable="true" data-type="divider">
                  <i class="fas fa-minus"></i>
                  <span>Divider</span>
                </div>
                <div class="element-item" draggable="true" data-type="spacer">
                  <i class="fas fa-arrows-alt-v"></i>
                  <span>Spacer</span>
                </div>
              </div>
            </div>

            <div class="sidebar-section">
              <h3 class="sidebar-title">Sections</h3>
              <div class="element-list">
                <div class="element-item" draggable="true" data-type="hero">
                  <i class="fas fa-star"></i>
                  <span>Hero</span>
                </div>
                <div class="element-item" draggable="true" data-type="features">
                  <i class="fas fa-th-large"></i>
                  <span>Features</span>
                </div>
                <div class="element-item" draggable="true" data-type="gallery">
                  <i class="fas fa-images"></i>
                  <span>Gallery</span>
                </div>
                <div class="element-item" draggable="true" data-type="testimonial">
                  <i class="fas fa-quote-right"></i>
                  <span>Testimonial</span>
                </div>
                <div class="element-item" draggable="true" data-type="contact">
                  <i class="fas fa-envelope"></i>
                  <span>Contact</span>
                </div>
                <div class="element-item" draggable="true" data-type="footer">
                  <i class="fas fa-shoe-prints"></i>
                  <span>Footer</span>
                </div>
              </div>
            </div>
          </div>

          <div class="canvas">
            <div class="canvas-content" id="canvas">
              <div class="placeholder">
                <i class="fas fa-plus-circle"></i>
                <h3>Your Canvas is Empty</h3>
                <p>Drag and drop elements from the sidebar to start building your page.</p>
              </div>
            </div>
          </div>

          <div class="properties-panel">
            <h3 class="sidebar-title">Properties</h3>
            <div id="no-selection" style="text-align: center; color: #999; padding: 20px;">
              <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
              <p>Select an element to edit its properties.</p>
            </div>

            <div id="properties-form" style="display: none;">
              <div class="form-group">
                <label class="form-label">Element Type</label>
                <input type="text" class="form-control" id="element-type" disabled>
              </div>

              <div class="form-group">
                <label class="form-label">Content</label>
                <textarea class="form-control" id="element-content" rows="3"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Font Size</label>
                <select class="form-control" id="element-font-size">
                  <option value="12px">Small (12px)</option>
                  <option value="16px" selected>Medium (16px)</option>
                  <option value="24px">Large (24px)</option>
                  <option value="32px">X-Large (32px)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Text Color</label>
                <div class="color-picker">
                  <div class="color-option active" style="background-color: #000000;" data-color="#000000"></div>
                  <div class="color-option" style="background-color: #ffffff; border: 1px solid #ddd;" data-color="#ffffff"></div>
                  <div class="color-option" style="background-color: #ff0000;" data-color="#ff0000"></div>
                  <div class="color-option" style="background-color: #00ff00;" data-color="#00ff00"></div>
                  <div class="color-option" style="background-color: #0000ff;" data-color="#0000ff"></div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Background Color</label>
                <div class="color-picker">
                  <div class="color-option" style="background-color: #000000;" data-color="#000000"></div>
                  <div class="color-option active" style="background-color: #ffffff; border: 1px solid #ddd;" data-color="#ffffff"></div>
                  <div class="color-option" style="background-color: #ff0000;" data-color="#ff0000"></div>
                  <div class="color-option" style="background-color: #00ff00;" data-color="#00ff00"></div>
                  <div class="color-option" style="background-color: #0000ff;" data-color="#0000ff"></div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Alignment</label>
                <div style="display: flex; gap: 10px;">
                  <button class="btn active" data-align="left"><i class="fas fa-align-left"></i></button>
                  <button class="btn" data-align="center"><i class="fas fa-align-center"></i></button>
                  <button class="btn" data-align="right"><i class="fas fa-align-right"></i></button>
                </div>
              </div>

              <div class="form-group">
                <button class="btn" style="background-color: var(--danger-color); width: 100%;">
                  <i class="fas fa-trash"></i> Delete Element
                </button>
              </div>
            </div>
          </div>
        </div>

        <script>
          // Page data
          const pageId = '${pageId}';
          const shop = '${shop}';

          // Save button functionality
          document.getElementById('save-btn').addEventListener('click', function() {
            alert('Page saved successfully!');
          });

          // Publish button functionality
          document.getElementById('publish-btn').addEventListener('click', function() {
            alert('Page published successfully!');
          });

          // Preview button functionality
          document.getElementById('preview-btn').addEventListener('click', function() {
            alert('Preview functionality will be available soon.');
          });

          // Basic drag and drop functionality
          const elements = document.querySelectorAll('.element-item');
          const canvas = document.getElementById('canvas');

          elements.forEach(element => {
            element.addEventListener('dragstart', function(e) {
              e.dataTransfer.setData('text/plain', this.getAttribute('data-type'));
            });
          });

          canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
          });

          canvas.addEventListener('drop', function(e) {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');

            // Remove placeholder if it exists
            const placeholder = canvas.querySelector('.placeholder');
            if (placeholder) {
              canvas.removeChild(placeholder);
            }

            // Create element based on type
            let newElement;

            switch(type) {
              case 'heading':
                newElement = document.createElement('h2');
                newElement.textContent = 'Heading Text';
                newElement.style.padding = '10px';
                newElement.style.margin = '10px 0';
                newElement.style.border = '1px dashed #ccc';
                break;
              case 'text':
                newElement = document.createElement('p');
                newElement.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.';
                newElement.style.padding = '10px';
                newElement.style.margin = '10px 0';
                newElement.style.border = '1px dashed #ccc';
                break;
              case 'image':
                newElement = document.createElement('div');
                newElement.innerHTML = '<div style="background-color: #f0f0f0; height: 200px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 48px; color: #999;"></i></div>';
                newElement.style.padding = '10px';
                newElement.style.margin = '10px 0';
                newElement.style.border = '1px dashed #ccc';
                break;
              case 'button':
                newElement = document.createElement('button');
                newElement.textContent = 'Button Text';
                newElement.className = 'btn';
                newElement.style.display = 'block';
                newElement.style.padding = '10px 20px';
                newElement.style.margin = '10px 0';
                newElement.style.border = '1px dashed #ccc';
                break;
              case 'hero':
                newElement = document.createElement('div');
                newElement.innerHTML = \`
                  <div style="background-color: #f0f0f0; padding: 60px 20px; text-align: center;">
                    <h1>Hero Title</h1>
                    <p style="margin: 20px 0;">Hero subtitle text goes here. This is a sample hero section.</p>
                    <button class="btn" style="background-color: #000; color: #fff; padding: 10px 20px;">Call to Action</button>
                  </div>
                \`;
                newElement.style.margin = '10px 0';
                newElement.style.border = '1px dashed #ccc';
                break;
              default:
                newElement = document.createElement('div');
                newElement.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Element';
                newElement.style.padding = '10px';
                newElement.style.margin = '10px 0';
                newElement.style.border = '1px dashed #ccc';
            }

            // Make the element selectable
            newElement.setAttribute('data-element-type', type);
            newElement.style.cursor = 'pointer';
            newElement.addEventListener('click', function(e) {
              e.stopPropagation();
              selectElement(this);
            });

            canvas.appendChild(newElement);
          });

          // Element selection functionality
          function selectElement(element) {
            // Remove selection from all elements
            document.querySelectorAll('[data-element-type]').forEach(el => {
              el.style.boxShadow = 'none';
            });

            // Add selection to clicked element
            element.style.boxShadow = '0 0 0 2px #000';

            // Show properties panel
            document.getElementById('no-selection').style.display = 'none';
            document.getElementById('properties-form').style.display = 'block';

            // Update properties form
            document.getElementById('element-type').value = element.getAttribute('data-element-type');

            // Set content based on element type
            if (element.getAttribute('data-element-type') === 'heading' ||
                element.getAttribute('data-element-type') === 'text' ||
                element.getAttribute('data-element-type') === 'button') {
              document.getElementById('element-content').value = element.textContent;
            } else {
              document.getElementById('element-content').value = 'Complex element - content editing limited';
            }
          }

          // Deselect when clicking on canvas
          canvas.addEventListener('click', function(e) {
            if (e.target === canvas) {
              document.querySelectorAll('[data-element-type]').forEach(el => {
                el.style.boxShadow = 'none';
              });

              document.getElementById('no-selection').style.display = 'block';
              document.getElementById('properties-form').style.display = 'none';
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Builder error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the builder: ${error.message}</p>
    `);
  }
});

module.exports = router;
