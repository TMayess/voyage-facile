<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center px-5">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('cancel')" />
        <div class="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5 shadow-2xl">
          <div class="flex justify-center">
            <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <UIcon name="i-heroicons-trash" class="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div class="text-center space-y-1.5">
            <h3 class="text-lg font-black text-white">Supprimer l'itinéraire ?</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Cette action est irréversible. L'itinéraire et tous ses lieux seront définitivement supprimés.</p>
          </div>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm font-bold text-gray-300 transition-all active:scale-[0.98]"
              @click="$emit('cancel')"
            >
              Annuler
            </button>
            <button
              class="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-sm font-black text-white transition-all active:scale-[0.98]"
              @click="$emit('confirm')"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active { transition: opacity 0.2s ease; }
.dialog-leave-active { transition: opacity 0.15s ease; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
</style>
