import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable strict TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "@typescript-eslint/no-unused-vars": "warn", // Change from error to warning
      "@typescript-eslint/no-empty-object-type": "off", // Disable empty interface rule
      
      // Disable React Hook exhaustive-deps warnings
      "react-hooks/exhaustive-deps": "warn", // Change from error to warning
      
      // Disable Next.js image optimization warnings
      "@next/next/no-img-element": "warn", // Change from error to warning
      
      // Allow console statements in development
      "no-console": "warn", // Change from error to warning
      
      // Relax some general rules
      "prefer-const": "warn", // Change from error to warning
      "no-var": "warn", // Change from error to warning
    },
  },
];

export default eslintConfig;
