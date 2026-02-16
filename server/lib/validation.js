import { z } from 'zod';

// ──────────────────────────────────────────────────────────────
// Schemas for structured AI output (Zod = JS equivalent of Pydantic)
// ──────────────────────────────────────────────────────────────

// Allowed modification categories — the AI must classify its change
export const ModificationCategory = z.enum([
  'color',           // Change color of element(s)
  'size',            // Change width, height, padding, margin, font-size
  'text',            // Change text content, labels, headings
  'layout',          // Change flex/grid arrangement, spacing, alignment
  'visibility',      // Show/hide, add/remove elements
  'style',           // Border, shadow, rounded corners, opacity
  'typography',      // Font weight, family, letter-spacing
  'interaction',     // Hover states, cursor, transitions
  'content',         // Add/replace images, icons, sections
  'full_regenerate', // Complete rebuild from scratch
]);

// The structured response the AI must return for modifications
export const ModifyResponseSchema = z.object({
  category: ModificationCategory,
  target: z.string().describe('CSS selector or data-component-id of targeted element'),
  description: z.string().describe('Plain English summary of the change made'),
  html: z.string().describe('The complete modified HTML output'),
});

// For generation requests
export const GenerateResponseSchema = z.object({
  component_type: z.enum([
    'landing_page', 'form', 'navigation', 'card', 'layout',
    'table', 'list', 'hero', 'modal', 'button', 'pricing',
    'footer', 'testimonial', 'faq', 'other',
  ]),
  description: z.string().describe('Summary of what was generated'),
  html: z.string().describe('The generated HTML output'),
});

// Request validation schemas
export const GenerateRequestSchema = z.object({
  description: z.string().min(1).max(2000),
  componentType: z.string().optional(),
  currentCode: z.string().max(100000).optional(),
});

export const ModifyRequestSchema = z.object({
  currentCode: z.string().min(1).max(100000),
  modification: z.string().min(1).max(2000),
  targetElement: z.string().max(200).optional(),
});

// ──────────────────────────────────────────────────────────────
// HTML Sanitization — strip dangerous patterns from AI output
// ──────────────────────────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  /<script[\s>]/gi,
  /on\w+\s*=/gi,                         // onclick=, onerror=, etc.
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<iframe[\s>]/gi,
  /<object[\s>]/gi,
  /<embed[\s>]/gi,
  /<form[^>]*action\s*=\s*["']?http/gi,  // forms posting to external URLs
  /eval\s*\(/gi,
  /document\.(cookie|domain|write)/gi,
  /window\.(location|open)/gi,
];

export function sanitizeHtml(html) {
  let clean = html;

  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, (match) => {
      console.warn(`Sanitizer stripped: ${match}`);
      return '<!-- sanitized -->';
    });
  }

  return clean;
}

// ──────────────────────────────────────────────────────────────
// Structural validation — ensure output is reasonable HTML
// ──────────────────────────────────────────────────────────────

export function validateHtmlOutput(html) {
  const errors = [];

  if (!html || html.trim().length === 0) {
    errors.push('Empty HTML output');
  }

  if (html.length > 100000) {
    errors.push('Output exceeds maximum size (100KB)');
  }

  // Must contain at least one HTML tag
  if (!/<[a-z][\s>]/i.test(html)) {
    errors.push('Output does not contain valid HTML tags');
  }

  // Should use Tailwind classes (our design system)
  if (!html.includes('class="') && !html.includes("class='")) {
    errors.push('Output does not use CSS classes (expected Tailwind)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ──────────────────────────────────────────────────────────────
// Diff safety — ensure modifications don't nuke the whole page
// ──────────────────────────────────────────────────────────────

export function validateModification(originalCode, newCode, category) {
  const warnings = [];

  // Count major structural elements
  const countElements = (code) => (code.match(/<(section|nav|div|header|footer|main|article)/gi) || []).length;
  const countComponentIds = (code) => (code.match(/data-component-id/gi) || []).length;

  const origElements = countElements(originalCode);
  const newElements = countElements(newCode);
  const origIds = countComponentIds(originalCode);
  const newIds = countComponentIds(newCode);

  // Unless it's a full regenerate, the AI shouldn't obliterate most of the page
  if (category !== 'full_regenerate') {
    // Lost more than 60% of structural elements
    if (origElements > 3 && newElements < origElements * 0.4) {
      warnings.push(`Structural elements dropped from ${origElements} to ${newElements}`);
    }

    // Lost most component IDs (these are our click targets)
    if (origIds > 2 && newIds < origIds * 0.5) {
      warnings.push(`Component IDs dropped from ${origIds} to ${newIds} — tap targets lost`);
    }
  }

  // Size sanity — output shouldn't shrink to nothing or explode
  const ratio = newCode.length / Math.max(originalCode.length, 1);
  if (ratio < 0.1) {
    warnings.push('Output is less than 10% of original size');
  }
  if (ratio > 10) {
    warnings.push('Output is 10x larger than original');
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

// ──────────────────────────────────────────────────────────────
// Build the structured system prompts with JSON schema
// ──────────────────────────────────────────────────────────────

export function getModifySystemPrompt() {
  return `You are a UI code modifier. You receive existing HTML with Tailwind CSS and a modification request.

You MUST respond with valid JSON matching this exact schema:
{
  "category": one of: "color", "size", "text", "layout", "visibility", "style", "typography", "interaction", "content", "full_regenerate",
  "target": "CSS selector or data-component-id of the element being changed",
  "description": "one-line summary of what you changed",
  "html": "the COMPLETE modified HTML (full page, not a fragment)"
}

Rules for the HTML:
- Keep all existing elements unless explicitly asked to remove them
- Maintain Tailwind CSS class styling
- Preserve data-component-id attributes on all major sections
- Make minimal changes to achieve the requested modification
- For color changes: only change color-related Tailwind classes (bg-*, text-*, border-*)
- For size changes: only change size-related classes (w-*, h-*, p-*, m-*, text-*)
- For text changes: only change text content inside elements
- NEVER add <script>, onclick, or any JavaScript
- NEVER remove sections that weren't asked to be removed

Respond ONLY with the JSON object. No markdown, no explanation.`;
}

export function getGenerateSystemPrompt(currentCode) {
  return `You are a UI code generator. Generate clean, modern HTML with inline Tailwind CSS classes.

You MUST respond with valid JSON matching this exact schema:
{
  "component_type": one of: "landing_page", "form", "navigation", "card", "layout", "table", "list", "hero", "modal", "button", "pricing", "footer", "testimonial", "faq", "other",
  "description": "one-line summary of what was generated",
  "html": "the complete HTML output"
}

Rules for the HTML:
- Use Tailwind CSS utility classes for all styling
- Make it mobile-responsive by default
- Use modern, clean design with good spacing and typography
- Include placeholder content that matches the description
- Use semantic HTML elements
- Make interactive elements look clickable (hover states, cursors)
- Use a cohesive color scheme (indigo/violet primary, gray neutrals)
- Add data-component-id attributes to major elements for click selection
- NEVER add <script>, onclick, or any JavaScript

${currentCode ? `The current UI code is:\n${currentCode}\n\nIncorporate the new component into the existing layout.` : 'Start fresh with this component.'}

Respond ONLY with the JSON object. No markdown, no explanation.`;
}
