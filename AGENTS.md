# Artifex-H5 Agent Guidelines

## Project Overview
Mobile NFT marketplace H5 app built with Vue 3.5+, Vite 7.0+, Vant 4.9+, Tailwind CSS 4.2+.

## Build Commands
```bash
npm run dev          # Start dev server
npm run dev:prod     # Dev server in production mode
npm run build        # Production build
npm run preview      # Preview production build

# Testing (not configured - see setup below)
npm test             # Run tests with Vitest (watch mode)
npm run test:run     # Run tests once
npm run test:coverage # Run with coverage
npm test -- --run src/utils/request.test.js # Run single test file

# Linting (not configured - see setup below)
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## Code Style Guidelines

### Imports
- Use `@` alias for src: `import { http } from '@/utils/request'`
- Vue Composition API from 'vue': `import { ref, computed, onMounted } from 'vue'`
- Group: external libs -> internal modules -> components

### Vue 3 Conventions
- Use `<script setup>` syntax
- Use `ref()` for primitives/objects, `reactive()` for complex state
- Use `computed()` for derived state
- Clean up in `onUnmounted()` (timers, intervals, event listeners)
- Avoid mixing Options API with Composition API

### Naming
- Components: PascalCase (`Login.vue`, `BottomNav.vue`)
- Files/utils: kebab-case (`request.js`, `auth.js`)
- Variables/functions: camelCase (`phoneNumber`, `handleLogin`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_TIMEOUT`)
- Booleans: prefix `is`/`has`/`can` (`isLoading`, `canSubmit`)
- Timers: suffix `timer` (`countdownTimer`)

### API Layer
```javascript
// src/api/auth.js
import { http } from '@/utils/request'

export function login(data) {
  return http.post('/auth/login', data)
}
```
- Export from `src/api/index.js`
- Use JSDoc for complex functions

### Request Utils (src/utils/request.js)
- Axios with 10s timeout
- Auto-adds `Authorization: Bearer {token}` from localStorage
- Response success: `data.code === 0 || data.success`
- On 401: clear token, redirect to `/login`

### Routing
- Lazy load: `component: () => import('@/views/Login.vue')`
- 404 catch: `path: '/:pathMatch(.*)*'`

### Error Handling
- Use `try/catch` for async operations
- Show errors via Vant `showToast`
- Never expose internal errors to users
- Disable buttons during async operations

### Styles
- Tailwind CSS for layout/styling
- Custom styles in `<style scoped>`
- Avoid `!important`
- Mobile-first: `sm:`, `md:`, `lg:` breakpoints

### Data Types
- Form validation via regex (phone: `/^1[3-9]\d{9}$/`)
- Use `localStorage` for token/user persistence
- `JSON.stringify/parse` for object storage

## Project Structure
```
src/
├── api/           # API modules (auth.js, nft.js, etc.)
├── components/    # Shared components (BottomNav, TopHeader, etc.)
├── router/        # Vue Router config
├── utils/         # Helpers (request.js)
├── views/         # Page components
│   ├── Home/      # Home page + sub-components
│   └── Login.vue  # Login page
├── assets/        # CSS, images
├── App.vue
└── main.js
```

## Environment Variables
- `VITE_API_PREFIX`: API base path (e.g., `/api`)
- `VITE_GEETEST_LOGIN_ID`: Geetest captcha ID

## Best Practices
1. Validate forms before submission
2. Clean up timers/intervals in `onUnmounted`
3. Handle loading states for async operations
4. Token expiry redirects to login automatically
5. 2-space indentation
6. No magic numbers - use constants

## Testing Setup (Optional)
```bash
npm install -D vitest @vue/test-utils jsdom
# Add to package.json: "test": "vitest"
# Add to vite.config.js: test: { environment: 'jsdom', globals: true }
```

## Linting Setup (Optional)
```bash
npm install -D eslint @eslint/js eslint-plugin-vue
# Add scripts: "lint": "eslint src --ext .js,.vue"
```