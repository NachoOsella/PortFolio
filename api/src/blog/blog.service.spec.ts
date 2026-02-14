import { BlogService } from './blog.service';
import { readBlogDocument, readBlogIndex } from '../common/content-files';

jest.mock('../common/content-files', () => ({
    readBlogDocument: jest.fn(),
    readBlogIndex: jest.fn(),
}));

const mockedReadBlogIndex = readBlogIndex as jest.MockedFunction<typeof readBlogIndex>;
const mockedReadBlogDocument = readBlogDocument as jest.MockedFunction<typeof readBlogDocument>;

describe('BlogService', () => {
    let service: BlogService;

    beforeEach(() => {
        service = new BlogService();
        mockedReadBlogIndex.mockReset();
        mockedReadBlogDocument.mockReset();
    });

    it('filters posts by tag', async () => {
        mockedReadBlogIndex.mockResolvedValue([
            {
                title: 'Post A',
                slug: 'post-a',
                date: '2026-01-01',
                tags: ['angular', 'nestjs'],
                excerpt: 'A',
                published: true,
                featured: false,
                coverImage: undefined,
                readingTime: '1 min read',
                wordCount: 120,
            },
            {
                title: 'Post B',
                slug: 'post-b',
                date: '2026-01-02',
                tags: ['typescript'],
                excerpt: 'B',
                published: true,
                featured: false,
                coverImage: undefined,
                readingTime: '2 min read',
                wordCount: 220,
            },
        ]);

        const posts = await service.getPosts({ tag: 'nestjs' });

        expect(posts).toHaveLength(1);
        expect(posts[0].slug).toBe('post-a');
    });

    it('returns full post content for a valid slug', async () => {
        mockedReadBlogDocument.mockResolvedValue({
            meta: {
                title: 'Post A',
                slug: 'post-a',
                date: '2026-01-01',
                tags: ['angular'],
                excerpt: 'A',
                published: true,
                featured: true,
                coverImage: './cover.png',
                readingTime: '1 min read',
                wordCount: 150,
            },
            content: '<h1>Post A</h1>',
            toc: [{ level: 2, text: 'Intro', id: 'intro' }],
        });

        const post = await service.getPostBySlug('post-a');

        expect(post?.slug).toBe('post-a');
        expect(post?.content).toContain('Post A');
        expect(post?.toc).toHaveLength(1);
    });
});
