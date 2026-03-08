import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAllSlugs, getPostBySlug } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import '../blog-styles.css';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
    const slugs = getAllSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};

    return {
        title: post.title,
        description: post.description,
        alternates: {
            canonical: `https://leadmeta.me/blog/${slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            url: `https://leadmeta.me/blog/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Params }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) notFound();

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>
                    <Link href="/" className="text-lg font-semibold">
                        <span className="font-bold">Lead</span>
                        <span className="font-light italic text-white/80">meta</span>
                    </Link>
                </div>
            </header>

            {/* Article */}
            <article className="container mx-auto px-4 py-12 max-w-3xl">
                <header className="mb-10">
                    <time
                        dateTime={post.date}
                        className="text-sm text-white/40 mb-3 block"
                    >
                        {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </time>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <p className="text-lg text-white/50">{post.description}</p>
                </header>

                <div className="blog-content">
                    <MDXRemote source={post.content} />
                </div>

                {/* CTA */}
                <div className="mt-16 p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to find leads?</h2>
                    <p className="text-white/60 mb-6">
                        Try Leadmeta free — no credit card required.
                    </p>
                    <Link
                        href="https://leadmeta.me"
                        className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                    >
                        Try it free →
                    </Link>
                </div>
            </article>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-white/40 text-sm">
                    <p>&copy; {new Date().getFullYear()} Leadmeta. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
