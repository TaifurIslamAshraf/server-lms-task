/** @type {import('lint-staged').Config} */
const config = {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{css,scss}": ["prettier --write"],
};

export default config;
