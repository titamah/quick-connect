// Export the edge runtime config first
export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  console.log('🔍 Edge function called for ID:', id);
  console.log('🔍 SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('🔍 SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
  console.log('🔍 SUPABASE_ANON_KEY length:', process.env.SUPABASE_ANON_KEY?.length);
  
  if (!id) {
    return new Response('Invalid remix ID', { status: 400 });
  }

  // Check if env vars exist
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables!');
    return new Response('Server configuration error', { status: 500 });
  }

  try {
    const supabaseUrl = `${process.env.SUPABASE_URL}/rest/v1/remixes?id=eq.${id}&select=*`;
    console.log('🔗 Fetching from:', supabaseUrl);
    
    // Fetch remix data from Supabase with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase error:', response.status, errorText);
      throw new Error(`Supabase returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Data received:', data);
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No remix found with ID:', id);
      throw new Error('Remix not found');
    }

    const remix = data[0];
    const thumbnailUrl = remix.thumbnail_url || 'https://www.qrki.xyz/og-image.png';
    console.log('🖼️ Using thumbnail:', thumbnailUrl);
    
    // Detect if this is a bot/crawler
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord|slackbot|skype|googlebot|bingbot|yahoo|duckduckbot/i.test(userAgent);
    
    console.log('🤖 Is Bot:', isBot, 'User-Agent:', userAgent);
    
    if (isBot) {
      // For bots: serve HTML with meta tags for social sharing
      console.log('🤖 Serving bot HTML');
      return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check out this QReation! - QRKI</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.qrki.xyz/remix/${id}">
  <meta property="og:title" content="Check out this QReation!">
  <meta property="og:description" content="Someone made this custom QR wallpaper and wants to share it with you. Remix it yourself on QRKI!">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://www.qrki.xyz/remix/${id}">
  <meta name="twitter:title" content="Check out this QReation!">
  <meta name="twitter:description" content="Someone made this custom QR wallpaper and wants to share it with you. Remix it yourself on QRKI!">
  <meta name="twitter:image" content="${thumbnailUrl}">
  
  <!-- Additional meta tags -->
  <meta name="description" content="Custom QR code wallpaper shared on QRKI. Click to remix and make it your own!">
  <link rel="canonical" href="https://www.qrki.xyz/remix/${id}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1>QReation Shared!</h1>
    <p>Someone shared their custom QR wallpaper with you.</p>
    <img src="${thumbnailUrl}" alt="Custom QR Wallpaper" style="max-width: 400px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <br><br>
    <a href="https://www.qrki.xyz/remix/${id}" style="background: #FC6524; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
      Remix This Design
    </a>
  </div>
</body>
</html>`, {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=300'
        }
      });
    } else {
      // For human users: Return the index.html but let client-side routing handle the route
      console.log('👤 Serving human user - letting React Router handle /remix/' + id);
      
      try {
        const appResponse = await fetch('https://www.qrki.xyz/index.html');
        let html = await appResponse.text();
        
        // Inject meta tags for consistency
        const metaTags = `
  <!-- Dynamic Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.qrki.xyz/remix/${id}">
  <meta property="og:title" content="Check out this QReation!">
  <meta property="og:description" content="Someone made this custom QR wallpaper and wants to share it with you. Remix it yourself on QRKI!">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Dynamic Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://www.qrki.xyz/remix/${id}">
  <meta name="twitter:title" content="Check out this QReation!">
  <meta name="twitter:description" content="Someone made this custom QR wallpaper and wants to share it with you. Remix it yourself on QRKI!">
  <meta name="twitter:image" content="${thumbnailUrl}">`;
        
        html = html.replace('</head>', `${metaTags}\n</head>`);
        
        return new Response(html, {
          headers: { 
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=60'
          }
        });
      } catch (fetchError) {
        console.error('❌ Failed to fetch React app:', fetchError);
        return Response.redirect('https://www.qrki.xyz', 302);
      }
    }

  } catch (error) {
    console.error('❌ Error in remix edge function:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Return fallback HTML 
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QRKI - Custom QR Wallpapers</title>
  
  <!-- Fallback Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.qrki.xyz">
  <meta property="og:title" content="QRKI - Custom QR Wallpapers">
  <meta property="og:description" content="Make lock screens that spark connections. Design custom QR code wallpapers for your phone.">
  <meta property="og:image" content="https://www.qrki.xyz/og-image.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="QRKI - Custom QR Wallpapers">
  <meta name="twitter:description" content="Make lock screens that spark connections">
  <meta name="twitter:image" content="https://www.qrki.xyz/og-image.png">
  
  <script>
    setTimeout(() => {
      window.location.href = 'https://www.qrki.xyz';
    }, 2000);
  </script>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1>Design Not Found</h1>
    <p>This remix link may have expired or is no longer available.</p>
    <p>Error: ${error.message}</p>
    <p>Redirecting to QRKI...</p>
    <a href="https://www.qrki.xyz" style="background: #FC6524; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
      Create Your Own Design
    </a>
  </div>
</body>
</html>`, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=60'
      },
      status: 404
    });
  }
}