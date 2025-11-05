import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  messageSchema,
  safeUrlSchema,
  sanitizeHtml,
  encodeForExternalUrl,
} from '../validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should reject emails over 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = emailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = emailSchema.safeParse('  user@example.com  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });
  });

  describe('passwordSchema', () => {
    it('should accept strong passwords', () => {
      const validPasswords = [
        'Password123',
        'StrongP@ss1',
        'MySecure1Pass',
      ];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'nouppercaseordigit',
        'NOLOWERCASE1',
        'NoDigits',
      ];

      weakPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });

    it('should require minimum 8 characters', () => {
      const result = passwordSchema.safeParse('Pass1');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 caractères');
      }
    });
  });

  describe('nameSchema', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Marie-Claire',
        "O'Brien",
        'José García',
        'François',
      ];

      validNames.forEach((name) => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });

    it('should reject names with numbers', () => {
      const result = nameSchema.safeParse('John123');
      expect(result.success).toBe(false);
    });

    it('should reject names with special characters', () => {
      const result = nameSchema.safeParse('John@Doe');
      expect(result.success).toBe(false);
    });

    it('should require minimum 2 characters', () => {
      const result = nameSchema.safeParse('J');
      expect(result.success).toBe(false);
    });
  });

  describe('messageSchema', () => {
    it('should accept clean messages', () => {
      const result = messageSchema.safeParse('This is a clean message');
      expect(result.success).toBe(true);
    });

    it('should reject messages with script tags', () => {
      const result = messageSchema.safeParse(
        'Hello <script>alert("xss")</script>'
      );
      expect(result.success).toBe(false);
    });

    it('should reject messages with javascript: protocol', () => {
      const result = messageSchema.safeParse('Click javascript:alert(1)');
      expect(result.success).toBe(false);
    });

    it('should reject messages with event handlers', () => {
      const result = messageSchema.safeParse(
        '<img src=x onerror=alert(1)>'
      );
      expect(result.success).toBe(false);
    });

    it('should reject messages with iframe tags', () => {
      const result = messageSchema.safeParse(
        'Test <iframe src="evil.com"></iframe>'
      );
      expect(result.success).toBe(false);
    });

    it('should enforce maximum length', () => {
      const longMessage = 'a'.repeat(1001);
      const result = messageSchema.safeParse(longMessage);
      expect(result.success).toBe(false);
    });
  });

  describe('safeUrlSchema', () => {
    it('should accept http and https URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://sub.domain.com/path?query=value',
      ];

      validUrls.forEach((url) => {
        const result = safeUrlSchema.safeParse(url);
        expect(result.success).toBe(true);
      });
    });

    it('should reject non-http protocols', () => {
      const invalidUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'ftp://example.com',
      ];

      invalidUrls.forEach((url) => {
        const result = safeUrlSchema.safeParse(url);
        expect(result.success).toBe(false);
      });
    });
  });
});

describe('Sanitization Functions', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = 'Hello <script>alert("xss")</script> World';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe('Hello  World');
      expect(clean).not.toContain('<script>');
    });

    it('should remove iframe tags', () => {
      const dirty = 'Test <iframe src="evil.com"></iframe> content';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<iframe>');
    });

    it('should remove event handlers', () => {
      const dirty = '<img src=x onerror=alert(1)>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('onerror=');
    });

    it('should remove javascript: protocol', () => {
      const dirty = '<a href="javascript:alert(1)">Click</a>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('javascript:');
    });

    it('should preserve safe HTML', () => {
      const safe = '<p>This is <strong>safe</strong> content</p>';
      const clean = sanitizeHtml(safe);
      expect(clean).toContain('<p>');
      expect(clean).toContain('<strong>');
    });
  });

  describe('encodeForExternalUrl', () => {
    it('should encode special characters', () => {
      const text = 'Hello World & Special Chars!';
      const encoded = encodeForExternalUrl(text);
      expect(encoded).toBe('Hello%20World%20%26%20Special%20Chars!');
    });

    it('should limit length to 200 characters', () => {
      const longText = 'a'.repeat(300);
      const encoded = encodeForExternalUrl(longText);
      const decoded = decodeURIComponent(encoded);
      expect(decoded.length).toBe(200);
    });

    it('should handle empty strings', () => {
      const encoded = encodeForExternalUrl('');
      expect(encoded).toBe('');
    });
  });
});
