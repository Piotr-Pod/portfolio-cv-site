# Timeline Icons

This directory contains custom icons for timeline items.

## Standards and Guidelines

### File Format
- **Recommended**: PNG with transparent background
- **Alternative**: SVG for vector graphics
- **Size**: 32x32px to 128x128px (will be scaled to 20x20px in timeline)
- **Background**: Transparent preferred

### Naming Convention
- Use kebab-case: `company-logo.png`, `certification-badge.svg`
- Include company/organization name when applicable
- Use descriptive names: `aws-certification.png`, `university-logo.png`

### Usage in Timeline
Add the `iconImage` field to timeline items:

```typescript
{
  id: 'example',
  type: 'work',
  title: 'Position Title',
  // ... other fields
  iconImage: '/images/timeline-icons/company-logo.png'
}
```

### Fallback System
1. If `iconImage` is provided → use custom image
2. If `customIcon` is provided → use Lucide icon with custom color
3. Otherwise → use default type icon with default color

### Examples
- Company logos for work positions
- University/school logos for education
- Certification badges for training
- Project logos for personal projects
