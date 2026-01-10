/**
 * Environment type declarations
 * These are defined by Vite at build time
 */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
  }
}

declare const process: {
  env: {
    NODE_ENV: "development" | "production" | "test";
  };
};
