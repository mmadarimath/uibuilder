# UI Builder (React + Tailwind CSS)

🚀 **Live Demo:** [https://mmadarimath.github.io/uibuilder/](https://mmadarimath.github.io/uibuilder/)

Offline UI builder for landing pages and Outlook-safe newsletters. Uses React functional components, Tailwind CSS, and LocalStorage persistence.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS 3.4** - Utility-first styling (app UI)
- **Bootstrap 5.3** - Responsive grid (exported landing pages only)
- **Lucide React** - Icon library
- **PostCSS + Autoprefixer** - CSS processing

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

## Features

### Landing Page Builder

- Step-by-step editor (Header, Hero, Content, Abstract, Form, Footer)
- Live preview with color-proofed contrast
- Logo upload with automatic invert on dark backgrounds
- Rich text paste sanitizer (headings, paragraphs, lists, inline bold/italic)
- Advanced form builder:
  - Multiple field types: text, email, phone, number, dropdown, country/state selects, checkboxes
  - Custom questions with country, checkbox group, and select options
  - Add/remove/reorder fields with collapsible accordion UI
  - PHP-ready submit button with name/value attributes
  - Privacy & opt-in checkbox support
- Optional hero subtitle and CTA button
- Fluid or constrained container layout
- Responsive Bootstrap grid in exported HTML

### Newsletter Builder

- Email-safe table-based layout (Outlook compatible)
- Hero section with optional subtitle, button, and split image layout
- Multi-line footer textarea for address/legal text
- VML buttons for Outlook desktop support
- Max width 700px for email clients

### General

- LocalStorage autosave + reset
- Export standalone HTML files
- Mobile-first responsive design in the builder app

## Notes

- Color inputs accept HEX only
- Exports are self-contained (inline styles, Bootstrap CDN for landing pages)
- Newsletter layout uses table structure for Outlook desktop compatibility
- Form fields save on blur (click outside) to allow free typing
