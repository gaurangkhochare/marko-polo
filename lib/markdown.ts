import { defaultSchema } from 'rehype-sanitize';

/**
 * Customized sanitization schema based on GitHub-flavored markdown rules:
 * - Allows common formatting, headings, tables, task lists, code blocks, images
 * - Disallows script tags, style injection, iframes, inline event handlers
 * - Ensures links have safe protocols (http, https, mailto)
 */
export const safeSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
    div: [...(defaultSchema.attributes?.div || []), 'className'],
    input: [
      ['type', 'checkbox'],
      ['disabled', true],
      ['checked', true],
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      'target',
      'rel',
      'href',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};

/**
 * Checks if a URL is external
 */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

