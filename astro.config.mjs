// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  site: 'https://arypratama.com',
  integrations: [
    mdx({
      remarkPlugins: [remarkGfm],
    }),
    tailwind(),
    sitemap({
      filter: (page) => {
        // Only index the homepage and blog posts publicly.
        // Everything else (content-schedule, prd, erd, task-list,
        // reports, prompts, plans, landing pages) stays out of the sitemap.
        const url = new URL(page);
        const isHome = url.pathname === '/';
        const isBlogPost = /^\/blog\/[^/]+\/$/.test(url.pathname);
        return isHome || isBlogPost;
      },
      // Index sitemap split: sitemap-0.xml contains everything that passes
      // the filter. With a single split we get sitemap-index.xml → sitemap-0.xml.
      entryLimit: 50000,
    }),
  ],
});
