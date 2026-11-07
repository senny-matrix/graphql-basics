<script setup lang="ts">
/**
 * A single post in a list. Presentational only — it receives data and emits
 * nothing, so it can be reused on the home page, the list page and the
 * live feed without modification.
 */
defineProps<{
  post: {
    id: string
    title: string
    body: string
    published: boolean
    author?: { id: string; name: string } | null
    comments?: Array<{ id: string; text: string }>
  }
}>()
</script>

<template>
  <article class="post-card card">
    <div class="row">
      <NuxtLink :to="`/posts/${post.id}`" class="post-title">
        {{ post.title }}
      </NuxtLink>
      <span class="badge" :class="post.published ? 'badge-live' : 'badge-warn'">
        {{ post.published ? 'published' : 'draft' }}
      </span>
      <span class="spacer" />
      <span class="muted small">by {{ post.author?.name ?? 'unknown' }}</span>
    </div>

    <p class="post-body muted">{{ post.body }}</p>

    <div class="row small muted">
      <span>{{ post.comments?.length ?? 0 }} comment(s)</span>
      <span class="spacer" />
      <NuxtLink :to="`/posts/${post.id}`" class="small">Open →</NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text);
}

.post-body {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
