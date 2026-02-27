<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1 p-6 container mx-auto">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>