<script setup>
import 'leaflet/dist/leaflet.css'
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const placeId = route.query.id || "4adcda09f964a520e83321e3" 

const map = ref(null)
const zoom = ref(6)

const { data: place, pending, error, refresh } = await useFetch('/api/place-details', {
  query: { id: placeId },
  immediate: false, 
})

const wikiImage = ref(null)

watch(place, async (newData) => {
  if (!newData) return
  
  try {
    const cleanName = newData.name.split('(')[0].trim()
    const title = encodeURIComponent(cleanName)

    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=1000&origin=*&redirects=1`
    
    const res = await fetch(url)
    const json = await res.json()
    
    const pages = json.query?.pages
    if (pages) {
      const firstPage = Object.values(pages)[0]
      if (firstPage.thumbnail) {
        wikiImage.value = firstPage.thumbnail.source
      } else {
        wikiImage.value = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000"
      }
    }
    setTimeout(() => {
      if (map.value?.leafletObject) {
        map.value.leafletObject.invalidateSize()
      }
    }, 300)
    
  } catch (err) {
    console.error("Erreur image Wikipedia:", err)
    wikiImage.value = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000"
  }
})

// Correction de l'URL Google Maps
const googleMapsUrl = computed(() => {
  if (!place.value?.latitude || !place.value?.longitude) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${place.value.latitude},${place.value.longitude}`
})


const monumentCoords = computed(() => {
  if (place.value?.latitude && place.value?.longitude) {
    return [place.value.latitude, place.value.longitude]
  }
  if (place.value?.geocodes?.main) {
    return [place.value.geocodes.main.latitude, place.value.geocodes.main.longitude]
  }
  return [47.21322, -1.559482]
})


const loadDetails = () => refresh()
</script>

<template>
  <div class="min-h-screen text-white p-4 md:p-8 font-sans">
    <div class="max-w-5xl mx-auto space-y-8">

      <div class="">
      
        <UButton
          :loading="pending"
          icon="i-heroicons-magnifying-glass"
          size="xl"
          color="amber"
          variant="solid"
          label="Charger les détails "
          class="rounded-full px-8 shadow-lg shadow-amber-500/20"
          @click="loadDetails"
        />
        <p v-if="error" class="text-[#D9B54A] text-sm italic">{{ error.statusMessage || 'Erreur lors du chargement' }}</p>
      </div>

      <div v-if="pending" class="flex flex-col justify-center items-center py-20 space-y-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-[#D9B54A] text-5xl" />
        <p class="text-gray-500 animate-pulse">Récupération des données Foursquare & Wikipedia...</p>
      </div>

      <div v-else-if="place" class="space-y-8 animate-in fade-in zoom-in-95 duration-500">

        <header class="relative h-[500px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
          <img 
            :src="wikiImage || 'https://images.unsplash.com/photo-1549918830-b1fea4eBD0c2?q=80&w=1000'" 
            class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt="Hero image"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12">
            <div class="flex gap-2 mb-4">
              <UBadge v-for="cat in place.categories" :key="cat.fsq_category_id" color="amber" variant="subtle" class="backdrop-blur-md">
                {{ cat.name }}
              </UBadge>
            </div>
            <h1 class="text-4xl md:text-6xl font-black mb-4 leading-tight">{{ place.name }}</h1>
            <div class="flex items-center text-gray-300 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <UIcon name="i-heroicons-map-pin" class="mr-2 text-[#D9B54A]" />
              {{ place.location?.formatted_address }}
            </div>
          </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 space-y-8">
            
            <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UCard class="bg-white/5 border-white/10 ring-0">
                <template #header><h3 class="font-bold flex items-center gap-2"><UIcon name="i-heroicons-phone" /> Contact</h3></template>
                <p class="text-gray-400">{{ place.tel || 'Non renseigné' }}</p>
                <p class="text-gray-400 mt-2 truncate">{{ place.email }}</p>
              </UCard>
              <UCard class="bg-white/5 border-white/10 ring-0">
                <template #header><h3 class="font-bold flex items-center gap-2"><UIcon name="i-heroicons-globe-alt" /> Site Web</h3></template>
                <a v-if="place.website" :href="place.website" target="_blank" class="text-[#D9B54A] hover:underline truncate block">
                  {{ place.website.replace('https://', '') }}
                </a>
                <span v-else class="text-gray-500 italic">Aucun site disponible</span>
              </UCard>
            </section>

            <section v-if="place.social_media" class="space-y-4">
              <h2 class="text-2xl font-bold">Communauté</h2>
              <div class="flex flex-wrap gap-3">
                <UButton v-if="place.social_media.instagram" :to="`https://instagram.com/${place.social_media.instagram}`" target="_blank" icon="i-simple-icons-instagram" color="pink" variant="soft">Instagram</UButton>
                <UButton v-if="place.social_media.facebook_id" :to="`https://facebook.com/${place.social_media.facebook_id}`" target="_blank" icon="i-simple-icons-facebook" color="blue" variant="soft">Facebook</UButton>
                <UButton v-if="place.social_media.twitter" :to="`https://twitter.com/${place.social_media.twitter}`" target="_blank" icon="i-simple-icons-twitter" color="sky" variant="soft">Twitter / X</UButton>
              </div>
            </section>

            <section v-if="place.related_places?.children" class="space-y-4">
              <h2 class="text-2xl font-bold">Dans ce lieu</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="child in place.related_places.children" :key="child.fsq_place_id" class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div class="p-3 bg-amber-500/20 rounded-xl">
                    <UIcon name="i-heroicons-building-library" class="text-[#D9B54A] text-xl" />
                  </div>
                  <div>
                    <p class="font-bold text-sm">{{ child.name }}</p>
                    <p class="text-xs text-gray-500">{{ child.categories?.[0]?.name }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

        <aside class="space-y-6">
  <div class="sticky top-8 space-y-4">
    <UCard class="bg-[#D9B54A] border-none">
      <div class="text-black space-y-4">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-calendar" class="text-2xl" />
          <div>
            <p class="text-xs font-black uppercase opacity-60">Dernière mise à jour</p>
            <p class="font-bold">{{ new Date(place.date_refreshed).toLocaleDateString('fr-FR') }}</p>
          </div>
        </div>
        <UButton
          block
          color="white"
          size="xl"
          label="Itinéraire Google Maps"
          icon="i-heroicons-map-pin"
          class="font-black"
          :to="googleMapsUrl"
          target="_blank"
        />
      </div>
    </UCard>

    <UCard :ui="{ body: { padding: 'p-0' } }" class="overflow-hidden border-white/10 bg-white/5 h-[300px]">
  <ClientOnly>
    <LMap
      ref="map"
      :zoom="15"
      :center="monumentCoords"
      :use-global-leaflet="false"
      style="height: 100%; width: 100%"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        layer-type="base"
        name="OpenStreetMap"
      />
      <LMarker :lat-lng="monumentCoords" />
    </LMap>
    
    <template #fallback>
      <div class="flex items-center justify-center h-full bg-white/5">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-500" />
      </div>
    </template>
  </ClientOnly>
</UCard>

    <div class="p-6 rounded-3xl border border-white/10 bg-white/5 text-sm text-gray-400 leading-relaxed italic">
      "Ce monument est classé dans la catégorie monument historique. Les données sont fournies par Foursquare API v3."
    </div>
  </div>
</aside>
        </div>
      </div>

      <div v-else class="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
        <div class="max-w-xs mx-auto space-y-4">
          <UIcon name="i-heroicons-circle-stack" class="text-5xl text-gray-700" />
          <p class="text-gray-500">Prêt pour l'exploration ? Cliquez sur le bouton de chargement en haut de page.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Optionnel : ajout d'un flou sur l'image au survol */
header::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
  pointer-events: none;
}
</style>