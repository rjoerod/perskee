import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/perskee/",
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use 'tokens' as *;\n@use 'mixins' as *;\n`,
				loadPaths: ["src/styles"],
			},
		},
	},
});
