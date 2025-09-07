export default async function handler(request) {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return new Response('Invalid remix ID', { status: 400 });
    }
  
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/remixes?id=eq.${id}&select=*`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Remix not found');
      }
  
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('Remix not found');
      }
  
      const remix = data[0];
      const thumbnailUrl = remix.thumbnail_url || 'https://your-domain.com/og-image.png';
      
      return new Response(`<!DOCTYPE html>
  <html>
  <head>
    <meta property="og:title" content="Check out this QReation!">
    <meta property="og:description" content="Someone made this custom QR wallpaper and wants to share it with you. Remix it yourself!">
    <meta property="og:image" content="${thumbnailUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${thumbnailUrl}">
    <script>window.location.replace('/remix/${id}');</script>
  </head>
  <body>Redirecting...</body>
  </html>`, {
        headers: { 'Content-Type': 'text/html' }
      });
  
    } catch (error) {
      return new Response(`<!DOCTYPE html>
  <html>
  <head>
    <meta property="og:title" content="QRKI - Custom QR Wallpapers">
    <meta property="og:description" content="Make lock screens that spark connections">
    <script>window.location.href = '/';</script>
  </head>
  <body>Redirecting...</body>
  </html>`, {
        headers: { 'Content-Type': 'text/html' },
        status: 404
      });
    }
  }
  
  export const config = {
    runtime: 'edge'
  };