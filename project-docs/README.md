# Counseling Session Review - Documentation

Welcome to the documentation for the Counseling Session Review application. This documentation serves as a comprehensive guide to understanding the project's architecture, features, and development workflow.

## Documentation Guide

The documentation is organized into several key sections:

1. [**Project Overview**](./01-project-overview.md)
   - Introduction to the application
   - Project architecture
   - Core features
   - Directory structure

2. [**Authentication and User Roles**](./02-authentication-and-roles.md)
   - Authentication system
   - User roles and permissions
   - Authentication flow
   - Database schema for authentication

3. [**Session Management and Audio Playback**](./03-session-management.md)
   - Session workflow
   - Key components
   - Audio playback system
   - Feedback system
   - Transcript system

4. [**Supervisor System**](./04-supervisor-system.md)
   - Supervisor workflow
   - Supervisor levels
   - Key components
   - Approval workflow
   - Feedback capabilities

5. [**Database Structure**](./05-database-structure.md)
   - Schema organization
   - Key tables
   - Relationships
   - Row-Level Security
   - Storage system

6. [**UI Components and Theming**](./06-ui-components-and-theming.md)
   - UI architecture
   - Component organization
   - Theming system
   - Responsive design
   - Specialized components

7. [**Development Workflow**](./07-development-workflow.md)
   - Environment setup
   - Project structure
   - Development scripts
   - Workflow processes
   - Supabase integration

8. [**Code Organization Guide**](./08-code-organization-guide.md)
   - Main application structure
   - Core component breakdown
   - Data flow explanation
   - State management overview
   - Code conventions and patterns
   - Guide for non-technical users

9. [**Component Refactoring Guide**](./09-component-refactoring.md)
   - Why components were refactored
   - SessionDetail component breakdown
   - AudioPlayer component breakdown
   - Benefits of the new structure
   - Working with refactored components

10. [**AudioSection Refactoring**](./audio-section-refactoring.md)
   - AudioSection component breakdown
   - Component structure and responsibilities
   - Custom hooks for visibility detection
   - Improvements and benefits

## How to Use This Documentation

This documentation is designed to be both a reference for existing team members and an onboarding resource for new developers. Here's how to make the most of it:

### For New Developers

1. Start with the [Project Overview](./01-project-overview.md) to understand the application's purpose and architecture.
2. Review the [Development Workflow](./07-development-workflow.md) to set up your local environment.
3. Read the [Code Organization Guide](./08-code-organization-guide.md) to understand how the codebase is structured.
4. Study the [Component Refactoring Guide](./09-component-refactoring.md) and [AudioSection Refactoring](./audio-section-refactoring.md) to learn about our recent component improvements.
5. Explore the other documents based on your specific role or the features you'll be working on.

### For Non-Technical Users

1. Begin with the [Project Overview](./01-project-overview.md) to understand what the application does.
2. Read the [Code Organization Guide](./08-code-organization-guide.md) for a high-level explanation of how the code works.
3. Review specific sections like [Session Management](./03-session-management.md) or [Supervisor System](./04-supervisor-system.md) based on your area of interest.

### For Existing Team Members

1. Use the documentation as a reference when working on specific features.
2. Consult the relevant sections when making architectural decisions.
3. Review the [Component Refactoring Guide](./09-component-refactoring.md) and [AudioSection Refactoring](./audio-section-refactoring.md) to understand recent code organization changes.
4. Keep the documentation updated as the project evolves.

## Contributing to the Documentation

If you find inaccuracies or have suggestions for improving this documentation, please:

1. Create a feature branch
2. Make your changes
3. Submit a pull request with a clear description of the improvements

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com) 