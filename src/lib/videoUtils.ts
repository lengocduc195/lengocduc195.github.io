/**
 * Chuyển đổi URL YouTube thành URL embed
 * Hỗ trợ các định dạng URL YouTube khác nhau:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - VIDEO_ID (chỉ ID)
 */
export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';

  // Nếu đã là URL embed, trả về nguyên vẹn
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Trích xuất video ID từ các định dạng URL khác nhau
  let videoId = '';

  try {
    // Định dạng: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    }
    // Định dạng: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    // Định dạng: https://youtube.com/shorts/VIDEO_ID
    else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
    }
    // Nếu chỉ là ID video (không phải URL đầy đủ)
    else if (!url.includes('/') && !url.includes('.')) {
      videoId = url;
    }
    // Nếu là URL khác, thử trích xuất ID từ cuối URL
    else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    }
    // Thử trích xuất ID từ bất kỳ URL nào có dạng /watch/ hoặc /video/
    else if (url.match(/\/(watch|video)\/([\w-]+)/)) {
      const match = url.match(/\/(watch|video)\/([\w-]+)/);
      videoId = match ? match[2] : '';
    }
  } catch (error) {
    console.error('Error parsing video URL:', error);
    // Nếu có lỗi khi phân tích URL, trả về URL gốc
    return url;
  }

  // Nếu không tìm thấy ID, trả về URL gốc
  if (!videoId) {
    return url;
  }

  // Trả về URL embed
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Kiểm tra xem URL có phải là URL video (YouTube, Vimeo, v.v.) hay không
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;

  const videoPatterns = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv'
  ];

  return videoPatterns.some(pattern => url.includes(pattern));
}

/**
 * Lấy thumbnail từ URL YouTube
 */
export function getYouTubeThumbnail(url: string): string {
  if (!url) return '';

  // Trích xuất video ID
  let videoId = '';

  // Định dạng: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch')) {
    const urlObj = new URL(url);
    videoId = urlObj.searchParams.get('v') || '';
  }
  // Định dạng: https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  // Định dạng: https://youtube.com/shorts/VIDEO_ID
  else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
  }
  // Định dạng: https://www.youtube.com/embed/VIDEO_ID
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }
  // Nếu chỉ là ID video (không phải URL đầy đủ)
  else if (!url.includes('/') && !url.includes('.')) {
    videoId = url;
  }

  // Nếu không tìm thấy ID, trả về empty string
  if (!videoId) {
    return '';
  }

  // Trả về URL thumbnail chất lượng cao
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
