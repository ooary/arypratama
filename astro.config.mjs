// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  site: 'https://arypratama.com',
  integrations: [
    mdx(),
    tailwind(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkGfm],
  },
});
