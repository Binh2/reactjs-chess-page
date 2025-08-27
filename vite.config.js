import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
    test: {
        environment: 'jsdom',
    }
    // dev: {
    //     sourcemap: true,
    //     rollupOptions: {
    //         input: {
    //             main: './public/index.html',
    //         }, 
    //     },
    // },
    // build: {
    //     minify: 'esbuild',
    //     sourcemap: true,
    //     rollupOptions: {
    //         input: {
    //             main: './public/index.html',
    //         },
    //         // output: {
    //         //     entryFileNames: `assets/[name].js`,
    //         //     chunkFileNames: `assets/[name].js`,
    //         //     assetFileNames: `assets/[name].[ext]`
    //         // }
    //     }
    // },
})