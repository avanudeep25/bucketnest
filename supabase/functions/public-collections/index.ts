
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Use the slug from URL params (sent as query parameters)
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

      // Map database field names to frontend field names
      const mappedItems = items ? items.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        destination: item.destination,
        itemType: item.item_type,
        activityType: item.activity_type,
        travelType: item.travel_type,
        timeframeType: item.timeframe_type,
        targetDate: item.target_date,
        targetWeek: item.target_week,
        targetMonth: item.target_month,
        targetYear: item.target_year,
        budgetRange: item.budget_range,
        link: item.link,
        notes: item.notes,
        tags: item.tags,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        completedAt: item.completed_at,
        imageUrl: item.image_url
      })) : [];

      // Order the items according to the collection's item_order
      const orderedItems = data.item_order && data.item_order.length > 0
        ? data.item_order
            .map(id => mappedItems.find(item => item.id === id))
            .filter(Boolean)
        : mappedItems || []

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
