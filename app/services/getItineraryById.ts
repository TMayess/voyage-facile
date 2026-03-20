import type { ItineraryModel } from '~/types/itinerary'

export const getItineraryById = async (id: string) => {
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
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // 🔐 ensures user only accesses their own data
        .single()

    if (error) throw error

    return data
}