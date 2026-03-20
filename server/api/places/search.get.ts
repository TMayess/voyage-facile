// server/api/places/search.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'

const FSQ_BASE_URL = 'https://places-api.foursquare.com/places/search'

export default defineEventHandler(async (event) => {
  const FSQ_API_KEY = useRuntimeConfig().foursquareApiKey
    const query = getQuery(event)

    const {
        query: searchQuery = '',
        near = 'Paris',
        limit = '8',
    } = query as {
        query?: string
        near?: string
        limit?: string
    }

    try {
        // Validate input
        if (!searchQuery || searchQuery.length < 2) {
            throw createError({
                statusCode: 400,
                message: 'La requête doit contenir au moins 2 caractères',
            })
        }

        // Build API request parameters
        const params = new URLSearchParams({
            query: searchQuery,
            near: near,
            limit: limit,
            sort: 'RATING',
            fields: 'fsq_place_id,name,social_media,location,distance,website,description,photos,rating,price,latitude,longitude,categories',
        })

        // Make request to Foursquare API
        const res = await fetch(`${FSQ_BASE_URL}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${FSQ_API_KEY}`,
                'Accept': 'application/json',
                'X-Places-Api-Version': '2025-06-17',
            },
        })

        if (!res.ok) {
            const err = await res.text()
            console.error('Foursquare API error:', err)
            throw createError({
                statusCode: res.status,
                message: `Erreur Foursquare API: ${err}`,
            })
        }

        const data = await res.json()
        return {
            success: true,
            results: data.results || [],
            count: (data.results || []).length,
        }
    } catch (err: any) {
        console.error('Error searching places:', err)

        // Return error response
        if (err.statusCode) {
            throw err
        }

        throw createError({
            statusCode: 500,
            message: 'Erreur lors de la recherche de lieux',
        })
    }
})
