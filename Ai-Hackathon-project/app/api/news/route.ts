import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/rss';
import { NewsTopic } from '@/types/news';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 min cache

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicsParam = searchParams.get('topics');

    let topics: NewsTopic[] | undefined = undefined;
    if (topicsParam) {
      topics = topicsParam.split(',').map((t) => t.trim() as NewsTopic);
    }

    const articles = await fetchAllNews(topics);

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/news failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch live morning feeds',
        articles: [],
      },
      { status: 500 }
    );
  }
}
