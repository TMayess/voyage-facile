<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
// ✅ Réactif
const placeId = computed(() => route.query.id)
const map = ref(null)

const { data: place, pending, error } = await useFetch('/api/place-details', {
  query: { id: placeId },
  watch: [placeId],
})
console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
console.log(place.value)

// ─── Image hero depuis les photos Foursquare ─────────────────────
const heroImage = computed(() => {
  const photos = place.value?.photos
  if (photos && photos.length > 0) {
    return photos[0].url_500  // ✅ URL déjà construite par l'API
  }
  return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000'
})
// ─── Fix icônes Leaflet ──────────────────────────────────────────
onMounted(async () => {
  if (import.meta.client) {
    const L = await import('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }
})

// ─── Recentre la map quand les données arrivent ──────────────────
function onMapReady() {
  nextTick(() => {
    setTimeout(() => {
      map.value?.leafletObject?.invalidateSize()
    }, 100)
  })
}

watch(place, async () => {
  await nextTick()
  setTimeout(() => {
    if (map.value?.leafletObject) {
      map.value.leafletObject.setView(monumentCoords.value, 15)
      map.value.leafletObject.invalidateSize()
    }
  }, 300)
})

// ─── Coordonnées ─────────────────────────────────────────────────
const monumentCoords = computed(() => {
  if (place.value?.latitude && place.value?.longitude) {
    return [place.value.latitude, place.value.longitude]
  }
  return [48.8566, 2.3522]
})

// ─── Google Maps ─────────────────────────────────────────────────
const googleMapsUrl = computed(() => {
  if (place.value?.latitude && place.value?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${place.value.latitude},${place.value.longitude}`
  }
  if (place.value?.name) {
    const query = encodeURIComponent(
      `${place.value.name} ${place.value.location?.formatted_address ?? ''}`
    )
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }
  return '#'
})
</script>

<template>
  <div class="min-h-screen text-white p-4 md:p-8 font-sans">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Error State -->
      <p v-if="error" class="text-[#D9B54A] text-sm italic">
        {{ error.statusMessage || 'Erreur lors du chargement' }}
      </p>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col justify-center items-center py-20 space-y-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-[#D9B54A] text-5xl" />
        <p class="text-gray-500 animate-pulse">Récupération des données Foursquare...</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="place" class="space-y-8 animate-in fade-in zoom-in-95 duration-500">

        <!-- ── Hero ── -->
        <header class="relative h-[500px] rounded-[2.5rem] overflow-hidden group shadow-2xl">

          <!-- Layout grille photos -->
          <div class="absolute inset-0 grid gap-1"
            :class="place.photos?.length > 1 ? 'grid-cols-[1fr_120px]' : 'grid-cols-1'">

            <!-- Photo principale -->
            <div class="relative overflow-hidden">
              <img
                :src="place.photos?.[0]?.url_500 ?? 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000'"
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt="Photo principale" />
            </div>

            <!-- Colonne miniatures -->
            <div v-if="place.photos?.length > 1" class="flex flex-col gap-1">
              <div v-for="(photo, i) in place.photos.slice(1, 4)" :key="i" class="relative flex-1 overflow-hidden">
                <img :src="photo.url_300"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                <!-- Overlay "+X" sur la dernière miniature si plus de 4 photos -->
                <div v-if="i === 2 && place.photos.length > 4"
                  class="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span class="text-white font-black text-xl">+{{ place.photos.length - 4 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Gradient + infos -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12">
            <div class="flex gap-2 mb-4 flex-wrap">
              <UBadge v-for="cat in place.categories" :key="cat.fsq_category_id" color="amber" variant="subtle"
                class="backdrop-blur-md">
                {{ cat.name }}
              </UBadge>
            </div>
            <h1 class="text-4xl md:text-6xl font-black mb-4 leading-tight">{{ place.name }}</h1>
            <div
              class="flex items-center text-gray-300 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <UIcon name="i-heroicons-map-pin" class="mr-2 text-[#D9B54A]" />
              {{ place.location?.formatted_address }}
            </div>
          </div>

        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- ── Colonne principale ── -->
          <div class="lg:col-span-2 space-y-8">

            <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UCard class="bg-white/5 border-white/10 ring-0">
                <template #header>
                  <h3 class="font-bold flex items-center gap-2">
                    <UIcon name="i-heroicons-phone" /> Contact
                  </h3>
                </template>
                <p class="text-gray-400">{{ place.tel || 'Non renseigné' }}</p>
                <p class="text-gray-400 mt-2 truncate">{{ place.email }}</p>
              </UCard>

              <UCard class="bg-white/5 border-white/10 ring-0">
                <template #header>
                  <h3 class="font-bold flex items-center gap-2">
                    <UIcon name="i-heroicons-globe-alt" /> Site Web
                  </h3>
                </template>
                <a v-if="place.website" :href="place.website" target="_blank"
                  class="text-[#D9B54A] hover:underline truncate block">
                  {{ place.website.replace('https://', '') }}
                </a>
                <span v-else class="text-gray-500 italic">Aucun site disponible</span>
              </UCard>
            </section>

            <!-- Description -->
            <section v-if="place.description" class="space-y-2">
              <h2 class="text-2xl font-bold">À propos</h2>
              <p class="text-gray-400 leading-relaxed">{{ place.description }}</p>
            </section>

            <!-- Réseaux sociaux -->
            <section v-if="place.social_media && Object.keys(place.social_media).length" class="space-y-4">
              <h2 class="text-2xl font-bold">Communauté</h2>
              <div class="flex flex-wrap gap-3">
                <UButton v-if="place.social_media.instagram"
                  :to="`https://instagram.com/${place.social_media.instagram}`" target="_blank"
                  icon="i-simple-icons-instagram" color="pink" variant="soft">Instagram</UButton>
                <UButton v-if="place.social_media.facebook_id"
                  :to="`https://facebook.com/${place.social_media.facebook_id}`" target="_blank"
                  icon="i-simple-icons-facebook" color="blue" variant="soft">Facebook</UButton>
                <UButton v-if="place.social_media.twitter" :to="`https://twitter.com/${place.social_media.twitter}`"
                  target="_blank" icon="i-simple-icons-twitter" color="sky" variant="soft">Twitter / X</UButton>
              </div>
            </section>

            <!-- Lieux enfants -->
            <section v-if="place.related_places?.children" class="space-y-4">
              <h2 class="text-2xl font-bold">Dans ce lieu</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="child in place.related_places.children" :key="child.fsq_place_id"
                  class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
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

          <!-- ── Aside ── -->
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
                  <a :href="googleMapsUrl" target="_blank" rel="noopener noreferrer"
                    class="flex items-center justify-center gap-2 w-full bg-black/20 hover:bg-black/30 text-black font-black text-sm py-3 px-4 rounded-xl transition-all">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                    Itinéraire Google Maps
                  </a>
                </div>
              </UCard>

              <!-- Map Leaflet -->
              <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5" style="height: 300px;">
                <ClientOnly>
                  <LMap ref="map" :zoom="15" :center="monumentCoords" :use-global-leaflet="false"
                    style="height: 300px; width: 100%; z-index: 0;" @ready="onMapReady">
                    <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>' layer-type="base"
                      name="OpenStreetMap" />
                    <LMarker :lat-lng="monumentCoords">
                      <LTooltip :options="{ permanent: true, direction: 'top' }">
                        {{ place.name }}
                      </LTooltip>
                    </LMarker>
                  </LMap>

                  <template #fallback>
                    <div class="flex items-center justify-center bg-white/5" style="height: 300px;">
                      <div class="flex flex-col items-center gap-3">
                        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-500" />
                        <p class="text-xs text-gray-600">Chargement de la carte…</p>
                      </div>
                    </div>
                  </template>
                </ClientOnly>
              </div>

              <div
                class="p-6 rounded-3xl border border-white/10 bg-white/5 text-sm text-gray-400 leading-relaxed italic">
                "Les données sont fournies par Foursquare Places API."
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
        <div class="max-w-xs mx-auto space-y-4">
          <UIcon name="i-heroicons-circle-stack" class="text-5xl text-gray-700" />
          <p class="text-gray-500">Aucun lieu trouvé pour cet identifiant.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
header::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

:deep(.leaflet-container) {
  height: 300px !important;
  width: 100% !important;
  background: #1f2937;
}
</style>