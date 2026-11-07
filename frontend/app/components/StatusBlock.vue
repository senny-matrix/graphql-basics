<script setup lang="ts">
/**
 * Reusable status banner. Pages pass `error` straight from a composable, so a
 * failed request is always visible instead of looking like an empty result.
 */
defineProps<{
  error?: string | null
  loading?: boolean
  empty?: boolean
  emptyText?: string
}>()
</script>

<template>
  <div v-if="error" class="alert alert-error" role="alert">
    {{ error }}
  </div>

  <div v-else-if="loading" class="stack" aria-busy="true">
    <div class="skeleton" />
    <div class="skeleton" />
  </div>

  <div v-else-if="empty" class="alert alert-empty">
    {{ emptyText ?? 'Nothing here yet.' }}
  </div>
</template>

<style scoped>
.skeleton {
  height: 3.5rem;
  border-radius: var(--radius);
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--surface-2) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
</style>
