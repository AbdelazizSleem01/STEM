import { NextResponse } from 'next/server';

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube video data');
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = data.items[0];
    const duration = video.contentDetails.duration; 
    const thumbnails = video.snippet.thumbnails;

    const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    let totalSeconds = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || 0);
      const minutes = parseInt(durationMatch[2] || 0);
      const seconds = parseInt(durationMatch[3] || 0);
      totalSeconds = hours * 3600 + minutes * 60 + seconds;
    }

    return NextResponse.json({
      duration: totalSeconds,
      thumbnails: {
        default: thumbnails.default?.url || '',
        medium: thumbnails.medium?.url || '',
        high: thumbnails.high?.url || '',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}