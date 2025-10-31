# 🎨 Coordinator Registration - Visual Design Guide

## User Type Selection

### Before (All Same):
```
┌─────────────────────────────────────────────────────────┐
│  [ 💑 Couple ]  [ 🏢 Vendor ]  [ 📋 Coordinator ]      │
│    All styled the same                                   │
└─────────────────────────────────────────────────────────┘
```

### After (Distinct Themes):
```
┌─────────────────────────────────────────────────────────┐
│  [ 💑 Couple ]     [ 🏢 Vendor ]     [ 📋 Coordinator ] │
│   Pink Theme       Purple Theme      Amber Theme        │
└─────────────────────────────────────────────────────────┘
```

---

## Business Information Section

### Vendor (Purple Theme):
```
╔═══════════════════════════════════════════════════════╗
║ 🏢 Business Information                     (Purple)  ║
╠═══════════════════════════════════════════════════════╣
║                                                         ║
║ 🟣 Business Name *                                     ║
║ ┌─────────────────────────────────────────────────┐   ║
║ │ Your Amazing Business Name                      │   ║
║ └─────────────────────────────────────────────────┘   ║
║    ↑ Purple focus ring                                 ║
║                                                         ║
║ 🏷️ Business Category *                (Purple icon)    ║
║ ┌─────────────────────────────────────────────────┐   ║
║ │ Photography                           ▼         │   ║
║ │  • Photography                                   │   ║
║ │  • Videography                                   │   ║
║ │  • Catering                                      │   ║
║ │  • Venue                                         │   ║
║ │  • Music/DJ                                      │   ║
║ │  • Flowers                                       │   ║
║ │  ...10 vendor types                              │   ║
║ └─────────────────────────────────────────────────┘   ║
║    ↑ Purple focus ring                                 ║
║                                                         ║
║ 📍 Business Location *               (Purple icon)     ║
║ ┌─────────────────────────────────────────────────┐   ║
║ │ Where is your business located?                 │   ║
║ └─────────────────────────────────────────────────┘   ║
║    ↑ Purple focus ring                                 ║
║                                                         ║
╚═══════════════════════════════════════════════════════╝
```

### Coordinator (Amber Theme):
```
╔═══════════════════════════════════════════════════════╗
║ 🏢 Coordination Business Information      (Amber)    ║
╠═══════════════════════════════════════════════════════╣
║                                                         ║
║ 🟡 Business Name *                                     ║
║ ┌─────────────────────────────────────────────────┐   ║
║ │ Dream Day Wedding Coordinators                  │   ║
║ └─────────────────────────────────────────────────┘   ║
║    ↑ Amber focus ring                                  ║
║                                                         ║
║ 🏷️ Business Category *                (Amber icon)     ║
║ ┌─────────────────────────────────────────────────┐   ║
║ │ Full-Service Wedding Planner          ▼         │   ║
║ │  • Full-Service Wedding Planner                  │   ║
║ │  • Day-of Coordinator                            │   ║
║ │  • Partial Planning Coordinator                  │   ║
║ │  • Destination Wedding Coordinator               │   ║
║ │  • Luxury Wedding Planner                        │   ║
║ │  • Budget Wedding Coordinator                    │   ║
║ │  • Corporate Event Coordinator                   │   ║
║ │  • Venue Coordinator                             │   ║
║ │  • Event Design & Planning                       │   ║
║ │  • Wedding Consultant                            │   ║
║ │  • Multi-Cultural Wedding Specialist             │   ║
║ │  • Other Coordination Services                   │   ║
║ │  ...12 coordinator types                         │   ║
║ └─────────────────────────────────────────────────┘   ║
║    ↑ Amber focus ring                                  ║
║                                                         ║
║ 📍 Business Location *               (Amber icon)      ║
║ ┌─────────────────────────────────────────────────┐   ║
║ │ Makati City, Metro Manila                       │   ║
║ └─────────────────────────────────────────────────┘   ║
║    ↑ Amber focus ring                                  ║
║                                                         ║
╚═══════════════════════════════════════════════════════╝
```

---

## Color Palette Comparison

### Vendor Theme (Purple):
- **Primary**: `#A855F7` (Purple-500)
- **Focus Border**: `#C084FC` (Purple-400)
- **Focus Ring**: `#F3E8FF` (Purple-100)
- **Background**: `from-purple-50/80 to-indigo-50/60`
- **Border**: `border-purple-200/50`

### Coordinator Theme (Amber):
- **Primary**: `#F59E0B` (Amber-500)
- **Focus Border**: `#FBBF24` (Amber-400)
- **Focus Ring**: `#FEF3C7` (Amber-100)
- **Background**: `from-amber-50/80 to-yellow-50/60`
- **Border**: `border-amber-200/50`

---

## Interactive States

### Vendor Input - Focus State:
```
┌──────────────────────────────────────────────────┐
│ Your Amazing Business Name                       │
└──────────────────────────────────────────────────┘
 ↑ Border: Purple-400 (#C084FC)
 ↑ Shadow: Purple-500/20 with glow
 ↑ Ring: 4px Purple-100 (#F3E8FF)
```

### Coordinator Input - Focus State:
```
┌──────────────────────────────────────────────────┐
│ Dream Day Wedding Coordinators                   │
└──────────────────────────────────────────────────┘
 ↑ Border: Amber-400 (#FBBF24)
 ↑ Shadow: Amber-500/20 with glow
 ↑ Ring: 4px Amber-100 (#FEF3C7)
```

---

## Icon Colors

### Vendor:
- Bullet Point: 🟣 Purple-500
- Tag Icon: 🟣 Purple-500
- MapPin Icon: 🟣 Purple-500

### Coordinator:
- Bullet Point: 🟡 Amber-500
- Tag Icon: 🟡 Amber-500
- MapPin Icon: 🟡 Amber-500

---

## Section Headers

### Vendor:
```
╔═══════════════════════════════════════╗
║ 🏢 Business Information               ║  ← Purple-800 text
║ ───────────────────────────────────── ║
║ [Purple gradient background]          ║
╚═══════════════════════════════════════╝
```

### Coordinator:
```
╔═══════════════════════════════════════╗
║ 🏢 Coordination Business Information  ║  ← Amber-800 text
║ ───────────────────────────────────── ║
║ [Amber gradient background]           ║
╚═══════════════════════════════════════╝
```

---

## Dropdown Menus

### Vendor Categories (10 options):
```
┌─────────────────────────────────────┐
│ Choose your specialty...       ▼   │
├─────────────────────────────────────┤
│ Photography                         │
│ Videography                         │
│ Wedding Planning                    │
│ Catering                            │
│ Venue                               │
│ Music/DJ                            │
│ Flowers                             │
│ Transportation                      │
│ Beauty & Makeup                     │
│ Other Services                      │
└─────────────────────────────────────┘
```

### Coordinator Categories (12 options):
```
┌─────────────────────────────────────┐
│ Choose your specialty...       ▼   │
├─────────────────────────────────────┤
│ Full-Service Wedding Planner        │
│ Day-of Coordinator                  │
│ Partial Planning Coordinator        │
│ Destination Wedding Coordinator     │
│ Luxury Wedding Planner              │
│ Budget Wedding Coordinator          │
│ Corporate Event Coordinator         │
│ Venue Coordinator                   │
│ Event Design & Planning             │
│ Wedding Consultant                  │
│ Multi-Cultural Wedding Specialist   │
│ Other Coordination Services         │
└─────────────────────────────────────┘
```

---

## Theme Psychology

### Purple (Vendors):
- **Creativity**: Represents artistic vendors (photographers, designers)
- **Luxury**: Associated with premium services
- **Innovation**: Modern and forward-thinking
- **Individuality**: Unique service offerings

### Amber/Golden (Coordinators):
- **Professionalism**: Business expertise and trust
- **Excellence**: High-quality service standards
- **Warmth**: Approachable and friendly
- **Achievement**: Success and accomplishment
- **Wisdom**: Experience and knowledge

---

## Accessibility Features

Both themes maintain:
- ✅ WCAG 2.1 AA contrast ratios
- ✅ Clear focus indicators (4px ring)
- ✅ Keyboard navigation support
- ✅ Screen reader labels
- ✅ Touch-friendly targets (44px minimum)

---

## Responsive Design

### Desktop (1200px+):
```
┌──────────────────────────────────────────────────┐
│ [Business Name]          [Business Category]     │
│ [Business Location - spans full width]           │
└──────────────────────────────────────────────────┘
```

### Tablet (768px - 1199px):
```
┌──────────────────────────────────────────────────┐
│ [Business Name]          [Business Category]     │
│ [Business Location - spans full width]           │
└──────────────────────────────────────────────────┘
```

### Mobile (<768px):
```
┌────────────────────────────┐
│ [Business Name]            │
│ [Business Category]        │
│ [Business Location]        │
└────────────────────────────┘
```

---

## Animation Effects

### Focus Transition:
```
Default State:
  border: gray-200 (2px)
  shadow: lg
  
Focus State (0.3s transition):
  border: amber-400 (2px)
  shadow: 2xl + amber-500/20 glow
  ring: 4px amber-100
```

### Hover Effects:
```
Default:
  shadow: lg
  
Hover:
  shadow: xl
  transform: none
```

---

## Best Practices Applied

1. ✅ **Consistent Spacing**: All inputs use same padding (px-4 py-4)
2. ✅ **Unified Border Radius**: rounded-2xl for modern look
3. ✅ **Smooth Transitions**: 300ms for all state changes
4. ✅ **Clear Visual Hierarchy**: Bold labels, spacious layout
5. ✅ **Validation Feedback**: Red borders/backgrounds for errors
6. ✅ **Placeholder Guidance**: Helpful example text
7. ✅ **Icon Consistency**: Same size (w-4 h-4) for all icons
8. ✅ **Theme Coherence**: Amber throughout coordinator form

---

## Testing the Design

### Visual Inspection:
1. Open: https://weddingbazaarph.web.app
2. Click "Register"
3. Select "Coordinator"
4. Verify amber theme applied
5. Click each input field
6. Verify amber focus rings
7. Open dropdown
8. Verify 12 coordinator categories
9. Test on mobile device
10. Verify responsive layout

### Theme Consistency:
- [ ] All bullets are amber
- [ ] All icons are amber
- [ ] All focus rings are amber
- [ ] Section background is amber gradient
- [ ] Dropdown shows coordinator categories
- [ ] Placeholder text is coordinator-appropriate

---

**Status**: ✅ **DESIGN IMPLEMENTED AND DEPLOYED**
**Production URL**: https://weddingbazaarph.web.app
**Last Updated**: October 31, 2025
