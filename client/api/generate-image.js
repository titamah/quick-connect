// Export the edge runtime config first
export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    console.log('🎨 Image generation request received');
  
    // Check if env vars exist
    if (!process.env.FAL_API_KEY) {
      console.error('❌ Missing FAL_API_KEY environment variable!');
      return new Response('Server configuration error', { status: 500 });
    }
  
    try {
      // Parse the request body
      const body = await request.json();
      
      // Validate required fields
      if (!body.prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // Extract and validate parameters
      const {
        prompt,
        negative_prompt = "text, letters, words, logos, watermarks, people, faces, low quality, blurry, horizontal, blank, empty",
        image_size = { width: 1290, height: 2796 },
        seed
      } = body;
  
      // Validate image size to prevent abuse
      const maxDimension = 4096;
      if (image_size.width > maxDimension || image_size.height > maxDimension) {
        return new Response(JSON.stringify({ error: 'Image dimensions too large' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      console.log('🔑 Making request to FAL AI...');
  
      // Make request to FAL AI
      const falResponse = await fetch(
        'https://fal.run/fal-ai/flux/schnell',
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${process.env.FAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            negative_prompt,
            image_size,
            seed: seed || Math.floor(Math.random() * 1000000),
          }),
        }
      );
  
      console.log('📡 FAL AI response status:', falResponse.status);
  
      if (!falResponse.ok) {
        const errorData = await falResponse.json().catch(() => ({}));
        console.error('❌ FAL AI error:', falResponse.status, errorData);
        
        // Don't expose the actual error details to the client
        return new Response(
          JSON.stringify({ error: 'Image generation failed. Please try again.' }), 
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
  
      const data = await falResponse.json();
      console.log('✅ Image generated successfully');
  
      // Return the response to the client
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
  
    } catch (error) {
      console.error('❌ Error in generate-image edge function:', error);
      
      return new Response(
        JSON.stringify({ error: 'An unexpected error occurred' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }