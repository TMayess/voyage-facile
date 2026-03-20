<script setup lang="ts">
interface PlaceDetail {
  fsq_place_id: string
  name: string
  latitude?: number
  longitude?: number
  location?: { formatted_address?: string; address?: string }
  categories?: { fsq_category_id: string; name: string }[]
  description?: string
  tel?: string
  email?: string
  website?: string
  rating?: number
  price?: number
  date_refreshed?: string
  photos?: { url_500?: string; url_300?: string; prefix: string; suffix: string }[]
  social_media?: { instagram?: string; facebook_id?: string; twitter?: string }
  related_places?: { children?: { fsq_place_id: string; name: string; categories?: { name: string }[] }[] }
}

const route = useRoute()
const placeId = computed(() => route.query.id)

const { data: place, pending, error } = await useFetch<PlaceDetail>('/api/place-details', {
  query: { id: placeId },
  watch: [placeId],
})

const monumentCoords = computed((): [number, number] => {
  if (place.value?.latitude && place.value?.longitude) {
    return [place.value.latitude, place.value.longitude]
  }
  return [48.8566, 2.3522]
})

const googleMapsUrl = computed(() => {
  if (place.value?.latitude && place.value?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${place.value.latitude},${place.value.longitude}`
  }
  if (place.value?.name) {
    const query = encodeURIComponent(`${place.value.name} ${place.value.location?.formatted_address ?? ''}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }
  return '#'
})
</script>

<template>
  <div class="min-h-screen text-white p-4 md:p-8 font-sans">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Error -->
      <p v-if="error" class="text-primary text-sm italic">
        {{ (error as any).statusMessage || 'Erreur lors du chargement' }}
      </p>

      <!-- Loading -->
      <div v-if="pending" class="flex flex-col justify-center items-center py-20 space-y-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-primary text-5xl" />
        <p class="text-gray-500 animate-pulse">Récupération des données Foursquare...</p>
      </div>

      <!-- Content -->
      <div v-else-if="place" class="space-y-8 animate-in fade-in zoom-in-95 duration-500">

        <PlaceHero
          :name="place.name"
          :photos="place.photos"
          :categories="place.categories"
          :formatted-address="place.location?.formatted_address"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Main column -->
          <div class="lg:col-span-2 space-y-8">

            <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UCard class="bg-white/5 border-white/10 ring-0">
                <template #header>
                  <h3 class="font-bold flex items-center gap-2"><UIcon name="i-heroicons-phone" /> Contact</h3>
                </template>
                <p class="text-gray-400">{{ place.tel || 'Non renseigné' }}</p>
                <p class="text-gray-400 mt-2 truncate">{{ place.email }}</p>
              </UCard>

              <UCard class="bg-white/5 border-white/10 ring-0">
                <template #header>
                  <h3 class="font-bold flex items-center gap-2"><UIcon name="i-heroicons-globe-alt" /> Site Web</h3>
                </template>
                <a v-if="place.website" :href="place.website" target="_blank" class="text-primary hover:underline truncate block">
                  {{ place.website.replace('https://', '') }}
                </a>
                <span v-else class="text-gray-500 italic">Aucun site disponible</span>
              </UCard>
            </section>

            <section v-if="place.description" class="space-y-2">
              <h2 class="text-2xl font-bold">À propos</h2>
              <p class="text-gray-400 leading-relaxed">{{ place.description }}</p>
            </section>

            <section v-if="place.social_media && Object.keys(place.social_media).length" class="space-y-4">
              <h2 class="text-2xl font-bold">Communauté</h2>
              <div class="flex flex-wrap gap-3">
                <UButton v-if="place.social_media.instagram" :to="`https://instagram.com/${place.social_media.instagram}`" target="_blank" icon="i-simple-icons-instagram" color="error" variant="soft">Instagram</UButton>
                <UButton v-if="place.social_media.facebook_id" :to="`https://facebook.com/${place.social_media.facebook_id}`" target="_blank" icon="i-simple-icons-facebook" color="info" variant="soft">Facebook</UButton>
                <UButton v-if="place.social_media.twitter" :to="`https://twitter.com/${place.social_media.twitter}`" target="_blank" icon="i-simple-icons-twitter" color="neutral" variant="soft">Twitter / X</UButton>
              </div>
            </section>

            <section v-if="place.related_places?.children" class="space-y-4">
              <h2 class="text-2xl font-bold">Dans ce lieu</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="child in place.related_places.children"
                  :key="child.fsq_place_id"
                  class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors"
                >
                  <div class="p-3 bg-amber-500/20 rounded-xl">
                    <UIcon name="i-heroicons-building-library" class="text-primary text-xl" />
                  </div>
                  <div>
                    <p class="font-bold text-sm">{{ child.name }}</p>
                    <p class="text-xs text-gray-500">{{ child.categories?.[0]?.name }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <PlaceAside
            :place="place"
            :google-maps-url="googleMapsUrl"
            :monument-coords="monumentCoords"
          />
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
        <div class="max-w-xs mx-auto space-y-4">
          <UIcon name="i-heroicons-circle-stack" class="text-5xl text-gray-700" />
          <p class="text-gray-500">Aucun lieu trouvé pour cet identifiant.</p>
        </div>
      </div>

    </div>
  </div>
</template>
