<script setup lang="ts">
interface StepMarker {
  index: number
  label: number
  coords: [number, number]
  stepName: string
  placeName: string
  startHour: string
  endHour: string
  meal: string | null
  rating: number | null
  photo: { prefix: string; suffix: string } | null
}

const props = defineProps<{
  stepMarkers: StepMarker[]
  mapCenter: [number, number]
  activeMarkerIndex: number | null
}>()

const emit = defineEmits<{
  'update:activeMarkerIndex': [value: number | null]
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

function createNumberedIcon(number: number, isMeal: boolean, isActive: boolean) {
  if (!import.meta.client) return undefined
  const L = (window as any).L
  if (!L) return undefined
  const bg     = isActive ? 'var(--color-primary)' : isMeal ? '#f97316' : '#1f2937'
  const color  = isActive ? '#000' : '#fff'
  const border = isActive ? 'var(--color-primary)' : isMeal ? '#f97316' : 'var(--color-primary)'
  return L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:${color};box-shadow:0 2px 10px rgba(0,0,0,0.5);">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

function toggleMarker(index: number) {
  emit('update:activeMarkerIndex', props.activeMarkerIndex === index ? null : index)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-5 pt-6">
    <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5" style="height:400px;">
      <ClientOnly>
        <LMap
          ref="map"
          :zoom="13"
          :center="mapCenter"
          :use-global-leaflet="false"
          style="height:400px; width:100%; z-index:0;"
          @ready="onMapReady"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            layer-type="base"
            name="OpenStreetMap"
          />
          <template v-for="marker in stepMarkers" :key="marker.index">
            <LMarker
              :lat-lng="marker.coords"
              :icon="createNumberedIcon(marker.label, !!marker.meal, activeMarkerIndex === marker.index)"
              @click="emit('update:activeMarkerIndex', marker.index)"
            >
              <LPopup :options="{ maxWidth: 260 }">
                <div style="font-family:sans-serif; color:#111; min-width:200px;">
                  <div v-if="marker.photo" style="height:90px; overflow:hidden; border-radius:8px; margin-bottom:8px;">
                    <img :src="`${marker.photo.prefix}300x200${marker.photo.suffix}`" style="width:100%; height:100%; object-fit:cover;" />
                  </div>
                  <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                    <span style="width:22px; height:22px; border-radius:50%; background:var(--color-primary); color:#000; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0;">{{ marker.label }}</span>
                    <span style="font-size:10px; color:#666; font-weight:700; text-transform:uppercase; letter-spacing:.08em;">
                      {{ marker.startHour }} — {{ marker.endHour }}
                      <span v-if="marker.meal" style="margin-left:4px; color:#f97316;">· {{ marker.meal }}</span>
                    </span>
                  </div>
                  <p style="font-size:13px; font-weight:800; margin:0 0 2px;">{{ marker.stepName }}</p>
                  <p style="font-size:11px; color:#555; margin:0 0 6px;">📍 {{ marker.placeName }}</p>
                  <span v-if="marker.rating" style="font-size:10px; font-weight:800; background:#fef3c7; color:#92400e; padding:2px 7px; border-radius:6px;">★ {{ marker.rating.toFixed(1) }}</span>
                </div>
              </LPopup>
            </LMarker>
          </template>
        </LMap>

        <template #fallback>
          <div class="flex items-center justify-center bg-white/5" style="height:400px;">
            <div class="flex flex-col items-center gap-3">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-500" />
              <p class="text-xs text-gray-600">Chargement de la carte…</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Légende markers -->
    <div class="flex flex-wrap gap-2 mt-3">
      <button
        v-for="marker in stepMarkers"
        :key="marker.index"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all"
        :class="activeMarkerIndex === marker.index
          ? 'bg-primary/20 border-primary/50 text-primary'
          : marker.meal
            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:border-orange-400/40'
            : 'bg-white/5 border-white/10 text-gray-400 hover:border-gray-600'"
        @click="toggleMarker(marker.index)"
      >
        <span
          class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
          :class="activeMarkerIndex === marker.index
            ? 'bg-primary text-black'
            : marker.meal ? 'bg-orange-500 text-white' : 'bg-gray-700 text-white'"
        >{{ marker.label }}</span>
        {{ marker.startHour }}
      </button>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  height: 400px !important;
  width: 100% !important;
  background: #1f2937;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
</style>
