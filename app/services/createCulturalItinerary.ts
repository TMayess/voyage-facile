import type { ItineraryStep, Pace, Affordability, ItineraryModel } from "~/types/itinerary"
import { searchPlaces } from "./searchPlaces"

export async function createCulturalItinerary(location: string, pace: Pace = 'balanced', minPrice: Affordability = 1, place: string): Promise<ItineraryModel> {
    let steps: ItineraryStep[] = [
        { step: 'Visite d’une place historique', categoryId: '4bf58dd8d48988d164941735', startHour: '08:00', endHour: '09:00' },
        { step: 'Visite d’un château ou palais', categoryId: '50aaa49e4b90af0d42d5de11', startHour: '09:00', endHour: '11:00' },
        { step: 'Exploration d’un musée', categoryId: '4bf58dd8d48988d181941735', startHour: '11:00', endHour: '13:00' },
        { step: 'Déjeuner traditionnel', categoryId: '4bf58dd8d48988d1e0941735', startHour: '13:00', endHour: '14:00', meal: 'Lunch' },
        { step: 'Balade dans un quartier historique', categoryId: '4f2a25ac4b909258e854f55f', startHour: '14:00', endHour: '16:00' },
        { step: 'Visite de monuments', categoryId: '4bf58dd8d48988d12d941735', startHour: '16:00', endHour: '17:30' },
        { step: 'Dîner culturel', categoryId: '4bf58dd8d48988d1e0941735', startHour: '19:00', endHour: '20:30', meal: 'Dinner' },
    ]

    if (pace === 'relaxed') {
        steps = steps.filter((_, i) => [0, 1, 3, 6].includes(i))
    }

    if (pace === 'intense') {
        steps.push({
            step: 'Visite d’un site mémoriel',
            categoryId: '5642206c498e4bfca532186c',
            startHour: '17:30',
            endHour: '18:30'
        })
    }

    for (const step of steps) {
        step['places'] = await searchPlaces(step, location, minPrice)
    }

    const itinerary: ItineraryModel = {
        name: 'Culturel',
        place,
        description: 'Découvrez l’histoire et le patrimoine local.',
        category: 'Cultural',
        steps
    }

    return itinerary
}