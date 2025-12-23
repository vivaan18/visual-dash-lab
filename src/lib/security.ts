/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitizes text input to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and decode HTML entities
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[#\w]+;/g, '') // Remove HTML entities
    .trim();
};

/**
 * Validates and sanitizes dashboard component data
 */
export const sanitizeDashboardComponent = (component: any): any => {
  if (!component || typeof component !== 'object') return component;
  
  const sanitized = { ...component };
  
  // Sanitize text fields that might contain user input
  if (sanitized.title && typeof sanitized.title === 'string') {
    sanitized.title = sanitizeText(sanitized.title);
  }
  
  if (sanitized.description && typeof sanitized.description === 'string') {
    sanitized.description = sanitizeText(sanitized.description);
  }
  
  if (sanitized.label && typeof sanitized.label === 'string') {
    sanitized.label = sanitizeText(sanitized.label);
  }
  
  // Sanitize chart data labels
  if (sanitized.data && Array.isArray(sanitized.data)) {
    sanitized.data = sanitized.data.map((item: any) => {
      if (item && typeof item === 'object') {
        const sanitizedItem = { ...item };
        if (sanitizedItem.name && typeof sanitizedItem.name === 'string') {
          sanitizedItem.name = sanitizeText(sanitizedItem.name);
        }
        if (sanitizedItem.label && typeof sanitizedItem.label === 'string') {
          sanitizedItem.label = sanitizeText(sanitizedItem.label);
        }
        return sanitizedItem;
      }
      return item;
    });
  }
  
  return sanitized;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a string contains only safe characters for names
 */
export const isValidName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.length <= 100;
};