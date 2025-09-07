export default async function handler(request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  if (!id) {
    return new Response('Invalid remix ID', { status: 400 });
  }

  try {
    // Fetch remix data from Supabase
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
    const thumbnailUrl = remix.thumbnail_url || 'https://qrki.xyz/og-image.png';
    
    // Detect if this is a bot/crawler
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord/i.test(userAgent);
    
    if (isBot) {
      // For bots: serve HTML with meta tags for social sharing
      return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check out this QReation! - QRKI</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://qrki.xyz/remix/${id}">
  <meta property="og:title" content="Check out this QReation!">
  <meta property="og:description" content="Check out this QReation. Remix it yourself on QRKI!">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://qrki.xyz/remix/${id}">
  <meta name="twitter:title" content="Check out this QReation!">
  <meta name="twitter:description" content="Check out this QReation. Remix it yourself on QRKI!">
  <meta name="twitter:image" content="${thumbnailUrl}">
  
  <!-- Additional meta tags -->
  <meta name="description" content="Custom QR code wallpaper shared on QRKI. Click to remix and make it your own!">
  <link rel="canonical" href="https://qrki.xyz/remix/${id}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1>QReation Shared!</h1>
    <p>Someone shared their custom QR wallpaper with you.</p>
    <img src="${thumbnailUrl}" alt="Custom QR Wallpaper" style="max-width: 400px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <br><br>
    <a href="https://qrki.xyz/remix/${id}" style="background: #FC6524; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
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
      // For human users: fetch and serve the React app with injected meta tags
      try {
        const appResponse = await fetch('https://qrki.xyz/index.html');
        let html = await appResponse.text();
        
        // Inject meta tags into the React app HTML
        const metaTags = `
  <!-- Dynamic Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://qrki.xyz/remix/${id}">
  <meta property="og:title" content="Check out this QReation!">
  <meta property="og:description" content="Check out this QReation. Remix it yourself on QRKI!">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Dynamic Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://qrki.xyz/remix/${id}">
  <meta name="twitter:title" content="Check out this QReation!">
  <meta name="twitter:description" content="Check out this QReation. Remix it yourself on QRKI!">
  <meta name="twitter:image" content="${thumbnailUrl}">`;
        
        // Insert meta tags before closing head tag
        html = html.replace('</head>', `${metaTags}\n</head>`);
        
        return new Response(html, {
          headers: { 
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=300'
          }
        });
      } catch (fetchError) {
        console.error('Failed to fetch React app:', fetchError);
        // Fallback: redirect to home page
        return Response.redirect('https://qrki.xyz', 302);
      }
    }

  } catch (error) {
    console.error('Error in remix edge function:', error);
    
    // Return fallback HTML for both bots and users
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QRKI - Custom QR Wallpapers</title>
  
  <!-- Fallback Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://qrki.xyz">
  <meta property="og:title" content="QRKI - Custom QR Wallpapers">
  <meta property="og:description" content="Make lock screens that spark connections. Design custom QR code wallpapers for your phone.">
  <meta property="og:image" content="https://qrki.xyz/og-image.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="QRKI - Custom QR Wallpapers">
  <meta name="twitter:description" content="Make lock screens that spark connections">
  <meta name="twitter:image" content="https://qrki.xyz/og-image.png">
  
  <script>
    // Redirect to home page after a brief delay
    setTimeout(() => {
      window.location.href = 'https://qrki.xyz';
    }, 2000);
  </script>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1>Design Not Found</h1>
    <p>This remix link may have expired or is no longer available.</p>
    <p>Redirecting to QRKI...</p>
    <a href="https://qrki.xyz" style="background: #FC6524; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
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

export const config = {
  runtime: 'edge'
};