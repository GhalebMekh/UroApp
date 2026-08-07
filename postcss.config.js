import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Point Tailwind at this project's config explicitly. The plugin otherwise
// searches from the process cwd, which may be a parent directory when a
// dev/preview runner launches Vite from outside UroApp — without this it
// silently falls back to Tailwind's default (empty) config.
const here = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: join(here, 'tailwind.config.js') },
    autoprefixer: {},
  },
};
