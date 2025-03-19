# UI Components and Theming

## UI Architecture Overview

The Counseling Session Review application uses a component-based architecture for its user interface. The UI is built with:

- **React**: Component framework
- **Tailwind CSS**: Utility-first styling
- **Shadcn/UI**: Component library based on Radix UI primitives
- **Lucide React**: Icon library
- **Custom Components**: Specialized components for audio playback and feedback

## Component Organization

The components are organized hierarchically:

1. **UI Components**: Low-level, reusable UI elements (`src/components/ui/`)
2. **Feature Components**: Mid-level components for specific features (`src/components/audio/`, etc.)
3. **Page Components**: High-level components representing full pages (`src/components/pages/`)
4. **Layout Components**: Components managing the overall layout (`src/components/dashboard/layout/`)

## UI Components Library

The application uses the Shadcn/UI component library, which provides:

- Accessible, unstyled components built on Radix UI
- Consistent design patterns
- Customizable theming
- Detailed documentation

Key UI components include:

- **Button**: Various button styles and states
- **Card**: Content containers with headers, footers, etc.
- **Dialog**: Modal dialogs and popovers
- **Tabs**: Tabbed interface components
- **Form Elements**: Inputs, selects, checkboxes, etc.
- **Toast**: Notification system
- **Avatar**: User avatars with fallback
- **Badge**: Status indicators

## Theming System

The application supports a dynamic theming system:

### Theme Provider

The `ThemeProvider` component in `src/context/ThemeContext.tsx` manages theme state:

- Light and dark mode support
- System preference detection
- User preference persistence
- Runtime theme switching

### Tailwind Configuration

The theming is implemented through Tailwind CSS:

```js
// tailwind.config.js
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Additional color definitions...
      },
      // Additional theme extensions...
    },
  },
  // Plugin configuration...
};
```

### CSS Variables

The themes are defined using CSS variables:

```css
/* index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --primary: 220.9 39.3% 11%;
    --primary-foreground: 210 20% 98%;
    /* Additional light theme variables... */
  }

  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;
    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;
    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;
    --primary: 210 20% 98%;
    --primary-foreground: 220.9 39.3% 11%;
    /* Additional dark theme variables... */
  }
}
```

## Responsive Design

The application is fully responsive, supporting various screen sizes:

- Mobile-first approach with Tailwind breakpoints
- Responsive layouts using Flexbox and Grid
- Component adaptations for different screen sizes
- Touch-friendly interactions for mobile devices

## Specialized UI Components

### Audio Interface Components

The application includes specialized UI components for audio processing:

- **Audio Player**: Waveform visualization and playback controls
- **Timeline**: Visual representation of session timeline with markers
- **Feedback Interface**: UI for adding and viewing timestamped feedback

### Dashboard Layout

The dashboard uses a comprehensive layout system:

- **Sidebar**: Navigation and context
- **TopNavigation**: User controls and global actions
- **Main Content Area**: Dynamic content based on current route
- **Responsive Adaptations**: Collapsible sidebar and mobile-friendly navigation

## Animation and Transitions

The application uses subtle animations for improved UX:

- **Framer Motion**: For complex animations
- **Tailwind Animations**: For simple transitions
- **CSS Transitions**: For hover states and basic interactions

## Accessibility

The UI is designed with accessibility in mind:

- **ARIA Attributes**: Proper semantic markup
- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader Support**: Alternative text and proper labeling
- **Color Contrast**: Sufficient contrast for readability

## Icon System

The application uses Lucide React for icons:

- Consistent icon style throughout the application
- Scalable vector icons
- Easy customization for size and color
- Semantic icon names for improved readability

## Implementation Examples

### Example: Theme Toggle Component

```tsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Example: Form Component with Validation

```tsx
export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Authentication logic
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional form fields */}
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );
}
``` 