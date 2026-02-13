import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
    }),
});

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        url: z.string().optional(),
        github: z.string().optional(),
    }),
});

export const collections = { blog, projects };
