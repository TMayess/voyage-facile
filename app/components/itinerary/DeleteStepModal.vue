<script setup lang="ts">
defineProps<{
  show: boolean
  stepName: string
  isRemoving: boolean
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="$emit('cancel')"
    >
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Supprimer l'étape ?</h3>
            <p class="text-gray-400 text-sm mt-1">
              Êtes-vous sûr de vouloir supprimer
              <span class="font-semibold text-white">{{ stepName }}</span> ?
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold text-sm transition-all"
            @click="$emit('cancel')"
          >
            Annuler
          </button>
          <button
            :disabled="isRemoving"
            class="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-semibold text-sm transition-all disabled:opacity-50"
            @click="$emit('confirm')"
          >
            {{ isRemoving ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
