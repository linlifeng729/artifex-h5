# Artifex-H5 Agent Guidelines

## Project Overview
This is a Vue 3 project using Vite as the build tool, Tailwind CSS for styling, and Vant UI component library. The project implements a login interface with geetest captcha verification.

## Development Commands

### General Commands
- `npm run dev` - Start development server
- `npm run dev:prod` - Start development server in production mode
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing
No testing framework is currently configured in this project. To run tests, you would need to:
1. Install a testing framework (e.g., Vitest, Jest)
2. Configure it in vite.config.js
3. Add test scripts to package.json

### Linting
No linting configuration is currently present. To add linting:
1. Install ESLint: `npm install -D eslint @vitejs/plugin-vue`
2. Create .eslintrc.js configuration
3. Add lint script to package.json

## Code Style Guidelines

### File Organization
- Components: `src/views/` for page-level components (Login.vue, Home.vue)
- API: `src/api/` for service functions (auth.js, nft.js, nftInstances.js, index.js)
- Router: `src/router/` for route definitions (index.js)
- Assets: `src/assets/` for static assets (css/style.css, images/)
- Main entry: `src/main.js`
- App component: `src/App.vue`
- Utilities: `src/utils/` for helper functions (request.js)

### Vue 3 Composition API
- Use `<script setup>` syntax for cleaner code (as seen in Login.vue)
- Import composition API functions from 'vue': `ref`, `computed`, `onMounted`, `onUnmounted`, `watch`
- Use reactive state with `ref()` for primitives and objects, `reactive()` for complex objects
- Use `computed()` for derived state that depends on reactive state
- Lifecycle hooks: `onMounted()` for initialization, `onUnmounted()` for cleanup
- Template references with `ref()` for accessing DOM elements or component instances
- Avoid mixing Options API and Composition API in the same component

### Imports
- Use `@` alias for src directory: `import { sendVerificationCode, login } from '@/api/auth'`
- Vue imports: `import { ref, computed, onUnmounted, onMounted } from 'vue'`
- Vant components: `import { showToast } from 'vant'` (import only what you need)
- Router: `import { useRouter } from 'vue-router'`
- Environment variables: `import.meta.env.VITE_VARIABLE_NAME`
- Group imports: 1) Vue/Vant/Vue Router, 2) API/services, 3) Components, 4) Utilities/helpers
- Use relative paths (`./`, `../`) for local imports within the same directory
- Always use the `@` alias for imports from src root

### Naming Conventions
- Components: PascalCase (Login.vue, Home.vue)
- Variables and functions: camelCase (phoneNumber, handleSendCodeClick, geetestCaptcha)
- Constants: UPPER_SNAKE_CASE (rarely used, but when used: MAX_COUNT, API_TIMEOUT)
- Files: kebab-case for utilities and helpers (request.js), PascalCase for components (Login.vue)
- API functions: camelCase matching backend endpoints (sendVerificationCode, login)
- Event handlers: prefixed with "handle" (handleSendCodeClick, handleLogin)
- Boolean variables: prefixed with "is", "has", "can" (isAgreed, canSendCode, canLogin)
- Timer variables: suffixed with "timer" (timer, countdownTimer)
- Instance variables: suffixed with "Instance" or just descriptive (geetestCaptcha)

### Styling
- Tailwind CSS utility classes for layout and styling (w-full, h-12, bg-[#3cb371], etc.)
- Custom CSS in `<style scoped>` blocks for component-specific styles and animations
- CSS animations defined with `@keyframes` (as seen with float animation in Login.vue)
- Responsive design with Tailwind's mobile-first approach (use sm:, md:, lg: prefixes when needed)
- Dark/light themes using Tailwind's color system (not currently implemented but structure supports it)
- Custom CSS classes should be scoped to prevent leakage
- Use CSS variables for theme colors if implementing dark/light modes
- Follow Tailwind's JIT mode principles - only use classes that are actually needed
- Avoid !important unless absolutely necessary (seen in Login.vue for button states)

### Types and Data Handling
- Props and emits not used in this Composition API setup (single-file components with script setup)
- Data validation with regex patterns (e.g., phone validation: `/^1[3-9]\d{9}$/`)
- Type inference from ref() values (phoneNumber is string, countdown is number)
- API response handling with try/catch blocks (see sendVerifyCodeWithCaptcha and handleLogin)
- LocalStorage for token and user info persistence (localStorage.setItem/getItem)
- JSON serialization for storing objects in localStorage (JSON.stringify/parse)
- Destructuring API responses when appropriate (`const { token, userInfo } = result`)
- Default values for refs: `ref('')` for strings, `ref(0)` for numbers, `ref(null)` for objects
- Avoid direct DOM manipulation; use template refs instead

### Error Handling
- Try/catch blocks for async operations (API calls)
- Toast notifications for user feedback using Vant's showToast (success/error messages)
- Console.error for debugging development issues
- Graceful degradation (e.g., checking if window.initGeetest4 exists before using)
- User-friendly error messages (don't expose internal errors to users)
- Loading states and button disabling during async operations
- Form validation before API calls (phone number format, agreement checkbox)
- Reset form fields on error (verification code cleared on login failure)
- Specific error handling for third-party widgets (geetest onError callback)

### Specific Patterns from Codebase
- Geetest captcha integration with async loading (load gt4.js on demand)
- Countdown timers with setInterval/clearInterval (60-second resend code timer)
- Form validation patterns (phone regex, agreement check, code length check)
- Loading states and button disabling (based on canSendCode/computed properties)
- Environment-based API proxy configuration (vite.config.js proxy based on VITE_API_PREFIX)
- Third-party widget cleanup (destroy geetest instance on unmount)
- Animated backgrounds with CSS keyframes (floating cubes)
- Conditional rendering based on state (showGeetestContainer controls captcha display)
- Computed properties for derived UI state (codeButtonText, canLogin, canSendCode)
- Event delegation for agreement toggle (toggleAgreement function)

## Best Practices
1. Always validate form inputs before API calls (phone format, agreement, code length)
2. Use computed properties for derived state (avoid recalculating in template)
3. Clean up timers and intervals in onUnmounted (clearInterval)
4. Destroy third-party widget instances (like Geetest) on unmount to prevent memory leaks
5. Use meaningful commit messages that explain why, not just what
6. Keep components focused and reusable (Login.vue handles login logic only)
7. Follow Vue 3 reactivity principles (don't mutate refs directly without .value)
8. Use Vant components consistently for UI elements (buttons, toasts)
9. Handle edge cases in async operations (network errors, invalid responses)
10. Maintain consistent indentation (2 spaces as seen in existing files)
11. Use descriptive variable names that clearly indicate purpose
12. Break complex functions into smaller, single-responsibility functions
13. Add JSDoc comments for complex functions (not currently used but recommended)
14. Use constants for magic numbers (60-second countdown could be named COUNTDOWN_SECONDS)
15. Follow the existing code style in the project (don't introduce conflicting styles)
16. Use template refs for accessing DOM elements when necessary
17. Implement proper loading states for better UX
18. Use environment variables for configuration (VITE_API_PREFIX, VITE_GEETEST_LOGIN_ID)
19. Handle third-party script loading gracefully with fallbacks
20. Clean up all resources (timers, intervals, event listeners, widget instances) on component unmount