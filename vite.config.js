import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv'


export default defineConfig(({ mode }) => { 
    require('dotenv').config({ path: './.env' });

    return {
        plugins: [react()],
        server: {
            port: 3011,
            allowedHosts: ['localhost', 'chess.binh2.dev'],
        },
        test: {
            environment: 'jsdom',
        },
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
    }
})