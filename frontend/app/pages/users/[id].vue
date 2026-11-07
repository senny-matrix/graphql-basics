<script setup lang="ts">
/**
 * User detail: proves the `user(id:)` query and walks the relations in the
 * other direction (user → posts, user → comments).
 */
const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, error, pending } = await useAsyncData(
  () => `user-${id.value}`,
  () => gql<{ user: any | null }>(QUERIES.user, { id: id.value }),
  { watch: [id] },
)

const notFound = computed(() => !pending.value && !error.value && !data.value?.user)
</script>

<template>
  <div class="stack">
    <NuxtLink to="/users" class="small">← All users</NuxtLink>

    <StatusBlock :error="error?.message" :loading="pending" />

    <div v-if="notFound" class="card stack">
      <h1 style="margin: 0">User not found</h1>
      <p class="muted" style="margin: 0">
        No user with id <code>{{ id }}</code>.
      </p>
      <NuxtLink to="/users" class="btn">Back to users</NuxtLink>
    </div>

    <template v-else-if="data?.user">
      <section class="card stack">
        <h1 style="margin: 0">{{ data.user.name }}</h1>
        <span class="muted small">{{ data.user.email }}</span>
        <span v-if="data.user.age !== null" class="muted small">Age {{ data.user.age }}</span>
      </section>

      <section class="stack">
        <h2 style="margin: 0">Posts ({{ data.user.posts.length }})</h2>
        <StatusBlock :empty="data.user.posts.length === 0" empty-text="This user has no posts." />

        <div v-for="post in data.user.posts" :key="post.id" class="card row">
          <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>
          <span class="spacer" />
          <span class="badge" :class="post.published ? 'badge-live' : 'badge-warn'">
            {{ post.published ? 'published' : 'draft' }}
          </span>
        </div>
      </section>

      <section class="stack">
        <h2 style="margin: 0">Comments ({{ data.user.comments.length }})</h2>
        <StatusBlock
          :empty="data.user.comments.length === 0"
          empty-text="This user has no comments."
        />

        <div v-for="comment in data.user.comments" :key="comment.id" class="card stack"
             style="gap: 0.2rem">
          <span class="small">{{ comment.text }}</span>
          <span class="muted small">
            on <NuxtLink :to="`/posts/${comment.post.id}`">{{ comment.post.title }}</NuxtLink>
          </span>
        </div>
      </section>
    </template>
  </div>
</template>
