# Development Workflow and Project Setup

## Development Environment Setup

### Prerequisites

To work on the Counseling Session Review application, you'll need the following tools installed:

- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **Git** for version control
- A code editor (Visual Studio Code recommended)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd session-recording-review
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_PROJECT_ID=your_supabase_project_id
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

### Key Directories

- `src/`: Main application code
  - `components/`: React components
  - `context/`: React context providers
  - `supabase/`: Supabase client configuration
  - `types/`: TypeScript type definitions
  - `lib/`: Utility functions
- `supabase/`: Supabase configuration and migrations
- `public/`: Static assets

### Configuration Files

- `package.json`: npm dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite bundler configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `components.json`: Shadcn/UI component configuration

## Development Scripts

The following npm scripts are available:

- `npm run dev`: Start the development server
- `npm run build`: Build the production-ready application
- `npm run lint`: Run ESLint to check for code issues
- `npm run preview`: Preview the production build locally
- `npm run types:supabase`: Generate TypeScript types from Supabase schema

## Development Workflow

### Feature Development

1. **Branch Creation**:
   - Create a feature branch from the main branch
   - Use a descriptive name (e.g., `feature/audio-player-enhancements`)

2. **Development**:
   - Implement the feature or fix
   - Write clean, maintainable code following project conventions
   - Use TypeScript for type safety

3. **Testing**:
   - Test the feature manually
   - Ensure it works in different browsers and screen sizes
   - Check for accessibility issues

4. **Code Review**:
   - Submit a pull request
   - Address review comments and make necessary changes
   - Ensure the code meets project standards

5. **Merging**:
   - Merge the feature branch into the main branch
   - Delete the feature branch after merging

### Code Standards

#### TypeScript

- Use proper typing for all variables, parameters, and return values
- Avoid using `any` type when possible
- Create interfaces or types for complex objects

#### React

- Use functional components with hooks
- Separate concerns into smaller, focused components
- Use React Context for state management when appropriate

#### Styling

- Use Tailwind CSS for styling
- Follow the project's design system
- Ensure responsive design for all components

## Database Management

### Local Development with Supabase

1. **Supabase CLI** (optional but recommended):
   - Install the Supabase CLI
   - Run a local Supabase instance for development

2. **Migrations**:
   - Database migrations are stored in `supabase/migrations/`
   - Apply migrations to your local database using the Supabase CLI

3. **Type Generation**:
   - After schema changes, run `npm run types:supabase`
   - This updates the TypeScript types to match the database schema

## Testing

### Manual Testing

- Test features across different browsers
- Verify mobile responsiveness
- Check for accessibility issues

### Potential Future Testing Implementation

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

## Deployment

### Build Process

1. Run `npm run build` to create a production build
2. The build artifacts will be stored in the `dist/` directory

### Deployment Options

- **Vercel**: The project is configured for Vercel deployment
- **Netlify**: Another viable hosting option
- **Custom Server**: Deploy the static build to any web server

## Supabase Integration

### Configuration

The Supabase client is configured in `src/supabase/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth-token'
  }
});
```

### Schema Updates

1. Create a new migration file in `supabase/migrations/`
2. Apply the migration to your local and remote Supabase instances
3. Update TypeScript types with `npm run types:supabase`

## Troubleshooting

### Common Issues

1. **Environment Variables**:
   - Ensure all required environment variables are set in `.env`
   - Restart the development server after changing environment variables

2. **Dependency Issues**:
   - Try deleting `node_modules` and `package-lock.json`
   - Run `npm install` to reinstall dependencies

3. **Supabase Connection**:
   - Verify that your Supabase project is running
   - Check that your API keys are correct in `.env`

### Getting Help

- Check the project documentation
- Consult the Supabase, React, and Vite documentation
- Reach out to the development team for assistance 