// TO shut up TypeScript errors about import.meta.env having no types

interface ImportMetaEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    // Add other environment variables here if needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}