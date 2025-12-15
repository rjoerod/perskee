# Perskee

A fully local, browser-based task management system built with React, TypeScript, and Vite. Perskee provides custom functionality not easily (or freely) available in traditional task management software, with all data stored locally in your browser using IndexedDB.

## Features

### Core Task Management
- **Multiple Boards**: Organize tasks across different boards for different projects or contexts
- **Kanban-Style Lists**: Create multiple lists within each board to organize tasks by status or category
- **Drag & Drop**: Intuitive drag-and-drop interface powered by @dnd-kit for reordering tasks and moving them between lists
- **Task Details**: Rich task information including:
  - Task name and description with Markdown support
  - Story points for effort estimation
  - Highlight flags for important tasks
  - Epic relationships for grouping related tasks

### Epic Management
- **Epics**: Create epic tasks that serve as parent containers for related subtasks
- **Epic Task Generation**: Automatically generate multiple tasks from an epic's description using a special syntax:
  - Use bullet points (`-`) to define individual tasks
  - Use headers (`#`) to organize sections
  - Use brackets (`[Option1, Option2]`) to generate multiple variations of tasks with different prefixes
  - Include descriptions in parentheses for each task
- **Epic Tracking**: View all tasks associated with an epic and track progress

### Advanced Filtering
- **Epic Filters**: Filter tasks by one or multiple epics
- **Title Search**: Find tasks by searching their names
- **Description Search**: Search within task descriptions
- **Highlighted Tasks**: Filter to show only highlighted/important tasks
- **Multi-Filter Support**: Combine multiple filters for precise task views

### Data Management
- **Local Storage**: All data stored locally in IndexedDB via Dexie.js - no server required
- **Import/Export**: Export your task data and import it later for use on other machines

### User Experience
- **Markdown Editor**: Rich text editing for task descriptions with markdown support
- **Toast Notifications**: Clear feedback for all actions
- **Confirmation Modals**: Prevent accidental deletions
- **Responsive Layout**: Clean, modern interface built with Tailwind CSS
- **Loading States**: Skeleton loaders for smooth user experience

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rjoerod/perskee.git
cd perskee
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server with hot module replacement:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Database**: Dexie.js (IndexedDB wrapper)
- **Styling**: Tailwind CSS with Typography plugin
- **Drag & Drop**: @dnd-kit
- **UI Components**: Headless UI, Heroicons
- **Markdown**: @uiw/react-md-editor, react-markdown
- **Routing**: React Router DOM
- **Notifications**: React Toastify

## Project Structure

```
src/
├── components/
│   ├── Board.tsx              # Main board component
│   ├── buttons/               # Reusable button components
│   ├── sections/              # Major UI sections
│   │   ├── Boards.tsx         # Board switcher
│   │   ├── ContainerList.tsx  # List container with drag-drop
│   │   ├── Filters.tsx        # Epic filters sidebar
│   │   ├── TaskFilters.tsx    # Advanced filter controls
│   │   └── Modal/             # Task modal components
│   ├── sortable/              # Drag-and-drop components
│   └── util/                  # Utility components
├── util/
│   ├── db.ts                  # Dexie database configuration
│   ├── types.ts               # TypeScript type definitions
│   ├── properties.ts          # Database column constants
│   └── queryRouting.ts        # URL query parameter utilities
└── App.tsx                    # Root application component
```
