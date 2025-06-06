/**
 * Utility functions for code minification
 */

/**
 * Minify HTML by removing comments, whitespace, and unnecessary attributes
 * @param html HTML string to minify
 * @returns Minified HTML string
 */
export function minifyHtml(html: string): string {
  if (!html) return '';
  
  return html
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading and trailing whitespace
    .trim()
    // Remove multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Remove unnecessary quotes from attributes when possible
    .replace(/(\s)([a-zA-Z0-9-]+)=["']([a-zA-Z0-9-_\.]+)["']/g, '$1$2=$3');
}

/**
 * Minify CSS by removing comments, whitespace, and unnecessary characters
 * @param css CSS string to minify
 * @returns Minified CSS string
 */
export function minifyCss(css: string): string {
  if (!css) return '';
  
  return css
    // Remove CSS comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace around selectors and declarations
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    // Remove last semicolon in each declaration block
    .replace(/;}/g, '}')
    // Remove leading and trailing whitespace
    .trim()
    // Remove multiple spaces
    .replace(/\s{2,}/g, ' ');
}

/**
 * Minify JavaScript by removing comments, whitespace, and unnecessary characters
 * @param js JavaScript string to minify
 * @returns Minified JavaScript string
 * 
 * Note: This is a simple minifier. For production use, consider using a proper
 * minifier like Terser or UglifyJS.
 */
export function minifyJs(js: string): string {
  if (!js) return '';
  
  return js
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace around operators
    .replace(/\s*([+\-*/%=<>!&|,;:?])\s*/g, '$1')
    // Remove whitespace around parentheses and brackets
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*\[\s*/g, '[')
    .replace(/\s*\]\s*/g, ']')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    // Remove leading and trailing whitespace
    .trim()
    // Remove multiple spaces
    .replace(/\s{2,}/g, ' ');
}

/**
 * Minify JSON by removing whitespace
 * @param json JSON string to minify
 * @returns Minified JSON string
 */
export function minifyJson(json: string): string {
  if (!json) return '';
  
  try {
    // Parse and stringify to remove all whitespace
    return JSON.stringify(JSON.parse(json));
  } catch (e) {
    // If parsing fails, return the original string
    console.error('Error minifying JSON:', e);
    return json;
  }
}

/**
 * Minify code based on its language
 * @param code Code string to minify
 * @param language Language of the code ('html', 'css', 'javascript', 'json')
 * @returns Minified code string
 */
export function minifyCode(code: string, language: string): string {
  if (!code) return '';
  
  switch (language.toLowerCase()) {
    case 'html':
      return minifyHtml(code);
    case 'css':
      return minifyCss(code);
    case 'javascript':
    case 'js':
      return minifyJs(code);
    case 'json':
      return minifyJson(code);
    default:
      // If language is not supported, return the original code
      return code;
  }
}

/**
 * Minify a complete page HTML with inline CSS and JavaScript
 * @param html Complete HTML page
 * @returns Minified HTML page
 */
export function minifyPage(html: string): string {
  if (!html) return '';
  
  // Minify inline CSS
  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
    return match.replace(css, minifyCss(css));
  });
  
  // Minify inline JavaScript
  html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
    return match.replace(js, minifyJs(js));
  });
  
  // Minify the HTML itself
  return minifyHtml(html);
}