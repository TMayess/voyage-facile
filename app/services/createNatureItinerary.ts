import type { ItineraryStep, Pace, Affordability, ItineraryModel } from "~/types/itinerary"
import { searchPlaces } from "./searchPlaces"
import { initCustomFormatter } from "vue"

export async function createNatureItinerary(location: string, pace: Pace = 'balanced', minPrice: Affordability = 1, place: string): Promise<ItineraryModel> {
    let steps: ItineraryStep[] = [
        { step: 'Randonnée matinale', categoryId: '4bf58dd8d48988d159941735', startHour: '07:30', endHour: '09:30' },
        { step: 'Petit-déjeuner pique-nique', categoryId: '4bf58dd8d48988d163941735', startHour: '09:30', endHour: '10:30', meal: 'Breakfast' },
        { step: 'Jardin botanique', categoryId: '52e81612bcbc57f1066b7a22', startHour: '10:30', endHour: '12:00' },
        { step: 'Déjeuner près d’un lac', categoryId: '4bf58dd8d48988d161941735', startHour: '12:00', endHour: '13:00', meal: 'Lunch' },
        { step: 'Activité plein air', categoryId: '56aa371be4b08b9a8d57355e', startHour: '13:00', endHour: '15:00' },
        { step: 'Point de vue', categoryId: '4bf58dd8d48988d165941735', startHour: '15:30', endHour: '16:30' },
        { step: 'Dîner', categoryId: '4bf58dd8d48988d1e0941735', startHour: '19:00', endHour: '20:30', meal: 'Dinner' },
    ]

    if (pace === 'relaxed') {
        steps = steps.filter((_, i) => [0, 1, 3, 6].includes(i))
    }

    if (pace === 'intense') {
        steps.push({
            step: 'Exploration supplémentaire en nature',
            categoryId: '52e81612bcbc57f1066b7a23',
            startHour: '16:30',
            endHour: '18:00'
        })
    }

    for (const step of steps) {
        step['places'] = await searchPlaces(step, location, minPrice)
    }

    const itinerary: ItineraryModel = {
        name: 'Nature',
        place,
        description: 'Profitez des espaces naturels et du plein air.',
        category: 'Nature',
        steps
    }

    return itinerary
}