// Authentication and validation utilities

export interface ValidationSchema {
  [key: string]: {
    type: "string" | "number" | "boolean" | "array" | "object";
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  sanitized: any;
  errors: string[];
}

// Validate and sanitize input data
export function validateAndSanitizeInput(
  data: any,
  schema: ValidationSchema,
): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};

  // Check for required fields
  for (const [key, rules] of Object.entries(schema)) {
    if (rules.required && (data[key] === undefined || data[key] === null)) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip validation if field is not provided and not required
    if (data[key] === undefined || data[key] === null) {
      continue;
    }

    const value = data[key];

    // Type validation and sanitization
    switch (rules.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`${key} must be a string`);
          break;
        }
        let sanitizedString = value.trim();
        if (rules.maxLength && sanitizedString.length > rules.maxLength) {
          errors.push(`${key} must be at most ${rules.maxLength} characters`);
          break;
        }
        if (rules.minLength && sanitizedString.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
          break;
        }
        sanitized[key] = sanitizedString;
        break;

      case "number":
        const num = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(num)) {
          errors.push(`${key} must be a valid number`);
          break;
        }
        if (rules.min !== undefined && num < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
          break;
        }
        if (rules.max !== undefined && num > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
          break;
        }
        sanitized[key] = num;
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`${key} must be a boolean`);
          break;
        }
        sanitized[key] = value;
        break;

      case "array":
        if (!Array.isArray(value)) {
          errors.push(`${key} must be an array`);
          break;
        }
        sanitized[key] = value;
        break;

      case "object":
        if (typeof value !== "object" || Array.isArray(value)) {
          errors.push(`${key} must be an object`);
          break;
        }
        sanitized[key] = value;
        break;

      default:
        sanitized[key] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
}

// Log SQL operations for debugging (development only)
export function logSQLPreview(
  operation: "select" | "insert" | "update" | "delete",
  table: string,
  data?: any,
  filters?: any,
) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[SQL Preview] ${operation.toUpperCase()} on ${table}`);
    if (data) {
      console.log("[SQL Preview] Data:", JSON.stringify(data, null, 2));
    }
    if (filters) {
      console.log("[SQL Preview] Filters:", JSON.stringify(filters, null, 2));
    }
  }
}

// Sanitize string for SQL LIKE operations
export function sanitizeForLike(input: string): string {
  return input.replace(/[%_]/g, "\\$&");
}

// Validate hex color format
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Validate priority values
export function isValidPriority(priority: string): boolean {
  return ["low", "medium", "high"].includes(priority);
}

// Validate status values
export function isValidStatus(status: string): boolean {
  return ["draft", "published", "review"].includes(status);
}
