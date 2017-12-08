// NOTE(bajtos) This file is used by TypeScript compiler to resolve imports
// from "test" files against original TypeScript sources in "src" directory.
// As a side effect, `tsc` also produces "dist/index.{js,d.ts,map} files
// that allow test files to import paths pointing to {src,test} root directory,
// which is project root for TS sources but "dist" for transpiled sources.
export * from './src';
