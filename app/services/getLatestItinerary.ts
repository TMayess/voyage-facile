// services/getLatestItinerary.ts
import type { ItineraryModel } from '~/types/itinerary'

export const getLatestItinerary = async (): Promise<ItineraryModel> => {
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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error

  return data
}