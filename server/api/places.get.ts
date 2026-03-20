// server/api/places.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'

import { createUrbanistItinerary } from '~/services/createUrbanistItinerary'
import { createCulturalItinerary } from '~/services/createCulturalItinerary'
import { createAttractionsItinerary } from '~/services/createAttractionsItinerary'
import { createNatureItinerary } from '~/services/createNatureItinerary'

import type { Pace, ItineraryStyle, Affordability } from "~/types/itinerary"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const {
        near = 'Casablanca',
        pace = 'balanced',
        style = 'Urbanist',
        affordability = 2,
    } = query as {
        near?: string
        pace?: Pace
        style?: ItineraryStyle
        affordability?: Affordability
    }

    try {
        let itinerary

        switch (style) {
            case 'Urbanist':
                itinerary = await createUrbanistItinerary(near, pace, affordability, near)
                break

            case 'Cultural':
                itinerary = await createCulturalItinerary(near, pace, affordability, near)
                break

            case 'Attractions':
                itinerary = await createAttractionsItinerary(near, pace, affordability, near)
                break

            case 'Nature':
                itinerary = await createNatureItinerary(near, pace, affordability, near)
                break

            default:
                throw createError({
                    statusCode: 400,
                    message: 'Style invalide',
                })
        }

        return itinerary

    } catch (error: any) {
        console.error('Error generating itinerary:', error)

        throw createError({
            statusCode: 500,
            message: error.message || 'Erreur lors de la génération de l’itinéraire',
        })
    }
})