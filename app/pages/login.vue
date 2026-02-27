<script setup lang="ts">
definePageMeta({
  layout: 'auth' // <--- C'est ici que la magie opère
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <AuthLoginForm />
  </div>
</template>