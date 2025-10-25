// Export the edge runtime config first
export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(request) {
    console.log('🗄️ Supabase proxy request received');
  
    // Check if env vars exist
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase environment variables!');
      return new Response('Server configuration error', { status: 500 });
    }
  
    try {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      
      // Route to appropriate handler based on action
      switch (action) {
        case 'upload':
          return await handleUpload(request);
        case 'create-remix':
          return await handleCreateRemix(request);
        case 'update-remix':
          return await handleUpdateRemix(request);
        case 'get-remix':
          return await handleGetRemix(request);
        case 'increment-views':
          return await handleIncrementViews(request);
        default:
          return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      console.error('❌ Error in supabase proxy:', error);
      return new Response(
        JSON.stringify({ error: 'An unexpected error occurred' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Helper function to get Supabase headers
  function getSupabaseHeaders(contentType = 'application/json') {
    return {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': contentType
    };
  }
  
  // Handle file upload to Supabase Storage
  async function handleUpload(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const fileType = formData.get('fileType') || 'image'; // 'image' or 'thumbnail'
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // Generate filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const prefix = fileType === 'thumbnail' ? 'thumb' : 'remix';
      const fileName = `${prefix}-${timestamp}-${randomStr}.webp`;
  
      console.log('📤 Uploading file to Supabase Storage:', fileName);
  
      // Upload to Supabase Storage
      const uploadResponse = await fetch(
        `${process.env.SUPABASE_URL}/storage/v1/object/remix-images/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
          },
          body: file
        }
      );
  
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed:', uploadResponse.status, errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
  
      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/remix-images/${fileName}`;
      console.log('✅ File uploaded successfully:', publicUrl);
  
      return new Response(JSON.stringify({ url: publicUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('❌ Upload error:', error);
      return new Response(
        JSON.stringify({ error: 'Upload failed' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Handle creating a new remix
  async function handleCreateRemix(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const body = await request.json();
      const { id, device_state, thumbnail_url } = body;
  
      if (!id || !device_state) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // Validate device_state size (max 50KB)
      const stateSize = JSON.stringify(device_state).length;
      if (stateSize > 51200) {
        return new Response(JSON.stringify({ error: 'Device state too large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      console.log('🆕 Creating remix:', id);
  
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/remixes`,
        {
          method: 'POST',
          headers: {
            ...getSupabaseHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            id,
            device_state,
            thumbnail_url
          })
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create remix failed:', response.status, errorText);
        throw new Error(`Failed to create remix: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('✅ Remix created successfully:', id);
  
      return new Response(JSON.stringify(data[0]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('❌ Create remix error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create remix' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Handle updating an existing remix
  async function handleUpdateRemix(request) {
    if (request.method !== 'PATCH') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const body = await request.json();
      const { id, device_state, thumbnail_url } = body;
  
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing remix ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      console.log('🔄 Updating remix:', id);
  
      const updateData = {};
      if (device_state) updateData.device_state = device_state;
      if (thumbnail_url) updateData.thumbnail_url = thumbnail_url;
  
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/remixes?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            ...getSupabaseHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update remix failed:', response.status, errorText);
        throw new Error(`Failed to update remix: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('✅ Remix updated successfully:', id);
  
      return new Response(JSON.stringify(data[0] || { id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('❌ Update remix error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update remix' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Handle getting a remix
  async function handleGetRemix(request) {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
  
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing remix ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      console.log('🔍 Fetching remix:', id);
  
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/remixes?id=eq.${id}&select=*`,
        {
          method: 'GET',
          headers: getSupabaseHeaders()
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get remix failed:', response.status, errorText);
        throw new Error(`Failed to get remix: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ error: 'Remix not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      console.log('✅ Remix fetched successfully:', id);
  
      return new Response(JSON.stringify(data[0]), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });
  
    } catch (error) {
      console.error('❌ Get remix error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch remix' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Handle incrementing view count
  async function handleIncrementViews(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const body = await request.json();
      const { id } = body;
  
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing remix ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      console.log('📈 Incrementing views for:', id);
  
      // First get current count
      const getResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/remixes?id=eq.${id}&select=view_count`,
        {
          method: 'GET',
          headers: getSupabaseHeaders()
        }
      );
  
      if (getResponse.ok) {
        const data = await getResponse.json();
        if (data && data.length > 0) {
          const currentCount = data[0].view_count || 0;
          
          // Update the count
          await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/remixes?id=eq.${id}`,
            {
              method: 'PATCH',
              headers: getSupabaseHeaders(),
              body: JSON.stringify({
                view_count: currentCount + 1
              })
            }
          );
  
          console.log('✅ View count incremented for:', id);
        }
      }
  
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('❌ Increment views error:', error);
      // Don't fail if view increment fails - it's not critical
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }