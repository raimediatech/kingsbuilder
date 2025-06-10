// api/utils/api-helpers.js - API helper utilities
const axios = require('axios');

/**
 * Make an API request with retry logic for transient errors
 * @param {Object} options - Axios request options
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} - API response
 */
async function makeApiRequest(options, retries = 3, delay = 1000) {
  try {
    return await axios(options);
  } catch (error) {
    // Check if error is retryable
    const isRetryable = isRetryableError(error);
    
    if (retries > 0 && isRetryable) {
      console.log(`Retrying API request in ${delay}ms (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiRequest(options, retries - 1, delay * 2);
    }
    
    // Add more context to the error
    const enhancedError = enhanceError(error);
    throw enhancedError;
  }
}

/**
 * Check if an error is retryable
 * @param {Error} error - Axios error
 * @returns {boolean} - Whether the error is retryable
 */
function isRetryableError(error) {
  // Network errors are retryable
  if (!error.response) {
    return true;
  }
  
  // 429 (Too Many Requests) and 5xx errors are retryable
  const status = error.response.status;
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Enhance an error with more context
 * @param {Error} error - Axios error
 * @returns {Error} - Enhanced error
 */
function enhanceError(error) {
  if (error.response) {
    // Add response data to error message
    const status = error.response.status;
    const data = error.response.data;
    
    error.message = `API Error (${status}): ${error.message}`;
    
    if (data && data.errors) {
      if (typeof data.errors === 'string') {
        error.message += ` - ${data.errors}`;
      } else if (Array.isArray(data.errors)) {
        error.message += ` - ${data.errors.join(', ')}`;
      } else if (typeof data.errors === 'object') {
        const errorMessages = [];
        
        for (const key in data.errors) {
          const value = data.errors[key];
          
          if (Array.isArray(value)) {
            errorMessages.push(`${key}: ${value.join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${value}`);
          }
        }
        
        error.message += ` - ${errorMessages.join('; ')}`;
      }
    }
  }
  
  return error;
}

module.exports = {
  makeApiRequest
};