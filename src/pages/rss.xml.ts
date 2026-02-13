import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
    const posts = (await getCollection('blog')).sort(
        (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
    );

    return rss({
        title: 'Ary Pratama Blog',
        description: 'Backend engineering, AI, system design, and tech thoughts by Ary Pratama.',
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description || '',
            link: `/blog/${post.slug}/`,
        })),
        customData: '<language>en-us</language>',
    });
}
