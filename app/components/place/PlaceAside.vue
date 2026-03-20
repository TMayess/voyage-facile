<script setup lang="ts">
interface PlaceDetail {
  name: string
  latitude?: number
  longitude?: number
  date_refreshed?: string
}

const props = defineProps<{
  place: PlaceDetail
  googleMapsUrl: string
  monumentCoords: [number, number]
}>()

const map = ref(null)

onMounted(async () => {
  if (import.meta.client) {
    const L = await import('leaflet')
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }
})

function onMapReady() {
  nextTick(() => {
    setTimeout(() => { (map.value as any)?.leafletObject?.invalidateSize() }, 100)
  })
}

watch(() => props.monumentCoords, async () => {
  await nextTick()
  setTimeout(() => {
    if ((map.value as any)?.leafletObject) {
      (map.value as any).leafletObject.setView(props.monumentCoords, 15)
      ;(map.value as any).leafletObject.invalidateSize()
    }
  }, 300)
})
</script>

<template>
  <aside class="space-y-6">
    <div class="sticky top-8 space-y-4">

      <UCard class="bg-primary border-none">
        <div class="text-black space-y-4">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-calendar" class="text-2xl" />
            <div>
              <p class="text-xs font-black uppercase opacity-60">Dernière mise à jour</p>
              <p class="font-bold">{{ place.date_refreshed ? new Date(place.date_refreshed).toLocaleDateString('fr-FR') : '—' }}</p>
            </div>
          </div>
          <a
            :href="googleMapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full bg-black/20 hover:bg-black/30 text-black font-black text-sm py-3 px-4 rounded-xl transition-all"
          >
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            Itinéraire Google Maps
          </a>
        </div>
      </UCard>

      <!-- Carte Leaflet -->
      <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5" style="height: 300px;">
        <ClientOnly>
          <LMap
            ref="map"
            :zoom="15"
            :center="monumentCoords"
            :use-global-leaflet="false"
            style="height: 300px; width: 100%; z-index: 0;"
            @ready="onMapReady"
          >
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              layer-type="base"
              name="OpenStreetMap"
            />
            <LMarker :lat-lng="monumentCoords">
              <LTooltip :options="{ permanent: true, direction: 'top' }">{{ place.name }}</LTooltip>
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

      <div class="p-6 rounded-3xl border border-white/10 bg-white/5 text-sm text-gray-400 leading-relaxed italic">
        "Les données sont fournies par Foursquare Places API."
      </div>
    </div>
  </aside>
</template>

<style scoped>
:deep(.leaflet-container) {
  height: 300px !important;
  width: 100% !important;
  background: #1f2937;
}
</style>
