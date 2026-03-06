import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts } from '@/lib/mdx';

export const metadata: Metadata = {
    title: 'Blog | Leadmeta',
    description: 'Tips, strategies, and guides for B2B lead generation. Learn how to find leads, automate outreach, and grow your sales pipeline.',
    alternates: {
        canonical: 'https://leadmeta.me/blog',
    },
    openGraph: {
        title: 'Blog | Leadmeta',
        description: 'Tips, strategies, and guides for B2B lead generation.',
    },
};

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <Link href="/" className="text-lg font-semibold">
                        <span className="font-bold">Lead</span>
                        <span className="font-light italic text-white/80">meta</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Blog</h1>
                    <p className="text-lg text-white/60">
                        Tips, strategies, and guides for B2B lead generation.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <p className="text-white/50">No blog posts yet. Stay tuned!</p>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="block group"
                            >
                                <article className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <time
                                            dateTime={post.date}
                                            className="text-sm text-white/40"
                                        >
                                            {new Date(post.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </time>
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 group-hover:text-white/90 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-white/50 leading-relaxed">
                                        {post.description}
                                    </p>
                                    <span className="inline-block mt-4 text-sm text-white/40 group-hover:text-white/60 transition-colors">
                                        Read more →
                                    </span>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-white/40 text-sm">
                    <p>&copy; {new Date().getFullYear()} Leadmeta. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
