import type { ItineraryModel } from '~/types/itinerary'

export const saveItinerary = async (itinerary: ItineraryModel) => {
    const supabase = useSupabaseClient()

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('itineraries')
        .insert([
            {
                name: itinerary.name,
                user_id: user.id,
                place: itinerary.place,
                description: itinerary.description,
                affordability: itinerary.affordability,
                category: itinerary.category,
                steps: itinerary.steps
            }
        ])
        .select('id') // 👈 only fetch id
        .single()

    if (error) throw error

    return data.id
}