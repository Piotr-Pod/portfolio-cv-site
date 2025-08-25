# Timeline Icons

This directory contains custom icons for timeline items.

## Standards and Guidelines

### File Format
- **Recommended**: PNG with transparent background
- **Alternative**: SVG for vector graphics
- **Size**: 32x32px to 128x128px (will fill the full 32x32px timeline container)
- **Background**: Transparent preferred (no background color will be added)

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
1. If `iconImage` is provided → use custom image with transparent background
2. If `customIcon` is provided → use Lucide icon with custom color
3. Otherwise → use default type icon with default color

### Background Behavior
- Custom images have transparent backgrounds and fill the entire circular container
- Images should be designed to look good without additional background colors
- Lucide icons retain their colored backgrounds for visual distinction
- Images will be cropped to circular shape automatically

### Examples
- Company logos for work positions
- University/school logos for education
- Certification badges for training
- Project logos for personal projects
