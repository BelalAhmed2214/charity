# Charity Frontend

This is the frontend application for the Charity project, built with modern web technologies.

## Tech Stack

- **Framework:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query/latest)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Routing:** [React Router](https://reactrouter.com/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (Package manager)

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for production:

```bash
pnpm build
```

To preview the production build:

```bash
pnpm preview
```

### Linting

Run the linter to check for code quality issues:

```bash
pnpm lint
```

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Application pages/routes
- `src/lib`: Utility functions and configurations
- `src/hooks`: Custom React hooks
- `src/api`: API integration and services
