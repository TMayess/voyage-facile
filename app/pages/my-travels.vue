<script setup lang="ts">
import type { ItineraryModel } from '~/types/itinerary'
import { getUserItineraries } from '~/services/getUserItineraries'

useHead({
  title: 'Mes Voyages',
  meta: [{ name: 'description', content: 'Retrouvez tous vos itinéraires créés.' }]
})

const { data: itineraries, pending, error } = await useAsyncData<ItineraryModel[]>(
  'user-itineraries',
  () => getUserItineraries()
)

const showDeleteDialog = ref(false)
const pendingDeleteId  = ref<string | null>(null)
const deletingId       = ref<string | null>(null)

function openDeleteDialog(id: string, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  pendingDeleteId.value  = id
  showDeleteDialog.value = true
}

function cancelDelete() {
  showDeleteDialog.value = false
  pendingDeleteId.value  = null
}

async function confirmDelete() {
  if (!pendingDeleteId.value) return
  const idToDelete       = pendingDeleteId.value
  showDeleteDialog.value = false
  deletingId.value       = idToDelete
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('itineraries').delete().eq('id', idToDelete)
    if (error) throw error
    if (itineraries.value) {
      itineraries.value = itineraries.value.filter(i => i.id !== idToDelete)
    }
  } catch (err: any) {
    console.error('Erreur suppression:', err.message)
  } finally {
    deletingId.value      = null
    pendingDeleteId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen text-white font-sans pb-20">

    <!-- Header -->
    <div class="bg-linear-to-b px-5 pt-10 pb-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-2">
          <NuxtLink to="/" class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div>
            <p class="text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-1">Votre collection</p>
            <h1 class="text-3xl font-black tracking-tight text-white">Mes Voyages</h1>
          </div>
        </div>
        <p class="text-gray-500 text-sm mt-3 ml-14">
          {{ itineraries?.length ?? 0 }} itinéraire{{ (itineraries?.length ?? 0) > 1 ? 's' : '' }} créé{{ (itineraries?.length ?? 0) > 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <Transition name="fade">
      <div v-if="pending" class="flex flex-col items-center justify-center py-32 gap-5">
        <div class="relative w-14 h-14">
          <div class="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div class="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-map" class="w-5 h-5 text-primary" />
          </div>
        </div>
        <p class="text-gray-500 text-sm animate-pulse">Chargement de vos voyages…</p>
      </div>
    </Transition>

    <!-- Error -->
    <Transition name="fade">
      <div v-if="error && !pending" class="max-w-2xl mx-auto px-5 pt-16 flex flex-col items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-400" />
        </div>
        <p class="text-gray-500 text-sm text-center">{{ error.message || 'Impossible de charger vos itinéraires.' }}</p>
      </div>
    </Transition>

    <!-- Empty state -->
    <Transition name="fade">
      <div v-if="!pending && !error && itineraries?.length === 0" class="max-w-2xl mx-auto px-5 pt-24 flex flex-col items-center gap-6 text-center">
        <div class="w-20 h-20 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center">
          <UIcon name="i-heroicons-map" class="w-9 h-9 text-gray-700" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white mb-2">Aucun voyage pour l'instant</h2>
          <p class="text-gray-500 text-sm max-w-xs">Créez votre premier itinéraire et retrouvez-le ici.</p>
        </div>
        <NuxtLink to="/" class="px-6 py-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-black font-black text-sm rounded-2xl transition-all">
          Créer un itinéraire
        </NuxtLink>
      </div>
    </Transition>

    <!-- Card list -->
    <Transition name="slide-up">
      <div v-if="!pending && itineraries && itineraries.length > 0" class="max-w-2xl mx-auto px-5 pt-6">
        <div class="flex flex-col gap-4">
          <TravelsDeleteDialog
            :show="showDeleteDialog"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
          />
          <TravelsTravelCard
            v-for="(item, index) in itineraries"
            :key="item.id"
            :item="item"
            :deleting-id="deletingId"
            :style="{ animationDelay: `${index * 60}ms` }"
            @delete="openDeleteDialog"
          />
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-up-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
</style>
