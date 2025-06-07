/**
 * Code Minification Utility
 * Handles minification of JavaScript, CSS, and HTML code
 */

import { minify as minifyHtml } from 'html-minifier';
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';

/**
 * Options for HTML minification
 */
const htmlMinifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
};

/**
 * Options for JavaScript minification
 */
const jsMinifyOptions = {
  compress: {
    dead_code: true,
    drop_console: false,
    drop_debugger: true,
    keep_fargs: false,
    unused: true,
  },
  mangle: true,
};

/**
 * Options for CSS minification
 */
const cssMinifyOptions = {
  level: 2,
};

/**
 * Class for handling code minification
 */
export class CodeMinifier {
  /**
   * Minify HTML code
   */
  static async minifyHtml(html: string): Promise<string> {
    try {
      return minifyHtml(html, htmlMinifyOptions);
    } catch (error) {
      console.error('Error minifying HTML:', error);
      return html;
    }
  }

  /**
   * Minify JavaScript code
   */
  static async minifyJs(js: string): Promise<string> {
    try {
      const result = await minifyJs(js, jsMinifyOptions);
      return result.code || js;
    } catch (error) {
      console.error('Error minifying JavaScript:', error);
      return js;
    }
  }

  /**
   * Minify CSS code
   */
  static minifyCss(css: string): string {
    try {
      const result = new CleanCSS(cssMinifyOptions).minify(css);
      return result.styles;
    } catch (error) {
      console.error('Error minifying CSS:', error);
      return css;
    }
  }

  /**
   * Minify code based on file type
   */
  static async minifyCode(code: string, fileType: string): Promise<string> {
    switch (fileType.toLowerCase()) {
      case 'html':
        return this.minifyHtml(code);
      case 'js':
      case 'javascript':
        return this.minifyJs(code);
      case 'css':
        return this.minifyCss(code);
      default:
        return code;
    }
  }

  /**
   * Minify a page's content
   * This assumes the page content is stored as a JSON string
   */
  static async minifyPageContent(pageContent: string): Promise<string> {
    try {
      // Parse the page content JSON
      const content = JSON.parse(pageContent);
      
      // Process each component that might have code
      if (content.components) {
        for (const component of content.components) {
          // Handle custom code widgets
          if (component.type === 'customCode' && component.properties) {
            if (component.properties.htmlContent) {
              component.properties.htmlContent = await this.minifyHtml(component.properties.htmlContent);
            }
            if (component.properties.cssContent) {
              component.properties.cssContent = this.minifyCss(component.properties.cssContent);
            }
            if (component.properties.jsContent) {
              component.properties.jsContent = await this.minifyJs(component.properties.jsContent);
            }
          }
          
          // Handle inline styles
          if (component.properties && component.properties.customCss) {
            component.properties.customCss = this.minifyCss(component.properties.customCss);
          }
        }
      }
      
      // Return the minified content as a JSON string
      return JSON.stringify(content);
    } catch (error) {
      console.error('Error minifying page content:', error);
      return pageContent;
    }
  }
}