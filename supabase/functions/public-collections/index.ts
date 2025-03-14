
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Use query parameter instead of path parameter
    const slug = url.searchParams.get('slug')

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Collection slug is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client with the Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Query the shared_collections table for the public collection with the given slug
    const { data, error } = await supabase
      .from('shared_collections')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('Error fetching collection:', error)
      return new Response(
        JSON.stringify({ error: 'Collection not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Collection not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // If the collection exists and is public, fetch the related wishlist items
    if (data.item_ids && data.item_ids.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .in('id', data.item_ids)

      if (itemsError) {
        console.error('Error fetching items:', itemsError)
        return new Response(
          JSON.stringify({ error: 'Error fetching collection items' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Order the items according to the collection's item_order
      const orderedItems = data.item_order && data.item_order.length > 0
        ? data.item_order
            .map(id => items.find(item => item.id === id))
            .filter(Boolean)
        : items || []

      // Return the collection with its items
      return new Response(
        JSON.stringify({ ...data, items: orderedItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Return the collection without items
      return new Response(
        JSON.stringify({ ...data, items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
