
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        include: [
            "@fullcalendar/core",
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react"
        ],
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    fullcalendar: [
                        "@fullcalendar/core",
                        "@fullcalendar/daygrid", 
                        "@fullcalendar/interaction",
                        "@fullcalendar/react"
                    ],
                },
            },
        },
    },
}));
