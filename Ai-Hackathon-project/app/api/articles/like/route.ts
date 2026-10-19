import { NextRequest, NextResponse } from 'next/server';
import { asyncDbLikeArticle, asyncDbGetArticleLikes, dbLogInteraction } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleId = body?.articleId;
    const userEmail = body?.userEmail;
    const isLiked = body?.isLiked; // boolean or undefined to toggle
    const articleTitle = body?.articleTitle;
    const category = body?.category || 'general';

    if (!articleId) {
      return NextResponse.json(
        { success: false, message: 'articleId is required.' },
        { status: 400 }
      );
    }

    const result = await asyncDbLikeArticle(articleId, userEmail, isLiked, articleTitle);

    // If upvoted, log interaction
    if (result.isLiked) {
      dbLogInteraction({
        userId: userEmail || 'anonymous',
        articleId,
        articleTitle: articleTitle || 'Article',
        category,
        action: 'upvote',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      articleId: result.articleId,
      likesCount: result.likesCount,
      isLiked: result.isLiked,
    });
  } catch (error: any) {
    console.error('Error in /api/articles/like POST:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update like counter.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');
    const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];

    const likesMap = await asyncDbGetArticleLikes(ids);

    return NextResponse.json({
      success: true,
      likes: likesMap,
    });
  } catch (error: any) {
    console.error('Error in /api/articles/like GET:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch article likes.' },
      { status: 500 }
    );
  }
}
