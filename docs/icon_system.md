# Icon System Documentation

## Overview

The Flow UI Toolkit uses Material Design Icons (MDI) from Pictogrammers for all icons in the application. This document describes how the icon system works and how to use it.

The icon system is designed to be performant and user-friendly:
- Icons are categorized into specific groups (e.g., "Haus & Gebäude", "Smart Home & HVAC")
- The search function works across all categories, regardless of which category is currently selected
- Search results are limited to 500 icons to maintain performance

## Dependencies

The icon system uses the following dependencies:

- `@mdi/js`: Contains all MDI icons as JavaScript objects
- `@mdi/react`: React component for rendering MDI icons

## Components

### IconRenderer

The `IconRenderer` component is a reusable component for rendering MDI icons. It takes the following props:

- `iconName`: The name of the icon to render (e.g., "mdiHome")
- `size`: The size of the icon (default: 1)
- `color`: The color of the icon (default: "currentColor")

Example usage:

```tsx
import IconRenderer from '../../components/common/IconRenderer';

const MyComponent = () => {
  return (
    <div>
      <IconRenderer iconName="mdiHome" size={1} color="#000000" />
    </div>
  );
};
```

### IconSelector

The `IconSelector` component is a dialog for selecting MDI icons. It takes the following props:

- `open`: Whether the dialog is open
- `onClose`: Function to call when the dialog is closed
- `onSelectIcon`: Function to call when an icon is selected
- `currentIcon`: The currently selected icon

Example usage:

```tsx
import { useState } from 'react';
import IconSelector from '../../components/IconSelector/IconSelector';

const MyComponent = () => {
  const [icon, setIcon] = useState('mdiHome');
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIconSelectorOpen(true)}>Select Icon</button>
      <IconSelector
        open={iconSelectorOpen}
        onClose={() => setIconSelectorOpen(false)}
        onSelectIcon={setIcon}
        currentIcon={icon}
      />
    </div>
  );
};
```

## Utilities

### mdiIcons.ts

The `mdiIcons.ts` file contains utility functions for working with MDI icons:

- `getMdiIconNames()`: Returns an array of all MDI icon names
- `categorizeIcon(iconName)`: Categorizes an icon based on its name
- `getCategorizedIcons()`: Returns an array of categorized icons
- `getIconPath(iconName)`: Returns the SVG path for an icon
- `iconExists(iconName)`: Checks if an icon exists in the MDI library
- `validateIcons()`: Validates all icons in the application

### iconMapping.ts

The `iconMapping.ts` file contains a mapping between Material UI icon names and MDI icon names:

- `materialToMdiMapping`: A record mapping Material UI icon names to MDI icon names
- `convertToMdiIconName(materialIconName)`: Converts a Material UI icon name to an MDI icon name
- `convertToMaterialIconName(mdiIconName)`: Converts an MDI icon name to a Material UI icon name

## Best Practices

1. Always use MDI icons with the `mdi` prefix (e.g., "mdiHome")
2. Use the `IconRenderer` component for rendering icons
3. Use the `IconSelector` component for selecting icons
4. Check if an icon exists in the MDI library before using it
5. Use the `getIconPath` function to get the SVG path for an icon

## Troubleshooting

If an icon is not rendering correctly, check the following:

1. Make sure the icon name starts with `mdi`
2. Make sure the icon exists in the MDI library
3. Make sure the `@mdi/js` and `@mdi/react` dependencies are installed
4. Check the console for any errors

## References

- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [@mdi/js Documentation](https://www.npmjs.com/package/@mdi/js)
- [@mdi/react Documentation](https://www.npmjs.com/package/@mdi/react)
