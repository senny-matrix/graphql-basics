<script setup lang="ts">
/**
 * Post detail page: proves the `post(id:)` query added to the backend, shows
 * nested relations (author, comments), and subscribes to new comments on this
 * specific post so the list grows live while the page is open.
 */
const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, error, pending, refresh } = await useAsyncData(
  () => `post-${id.value}`,
  () =>
    gql<{ post: any | null }>(QUERIES.post, { id: id.value }),
  { watch: [id] },
)

// A missing post is not an error — it is a null result the UI explains.
const notFound = computed(() => !pending.value && !error.value && !data.value?.post)

// --- live comments -------------------------------------------------------
const events = ref<Array<{ mutation: string; text: string; author: string }>>([])

const { status: liveStatus, error: liveError } = useGqlSubscription<any>(
  SUBSCRIPTIONS.comment,
  { postId: id.value },
  (payload) => {
    events.value.unshift({
      mutation: payload.mutation,
      text: payload.data.text,
      author: payload.data.author?.name ?? 'unknown',
    })

    // The payload carries the new comment, so it is cheaper to refetch than to
    // splice the cache by hand — and it keeps updates/deletes consistent.
    refresh()
  },
)

// --- add a comment -------------------------------------------------------
const { data: commentAuthors } = await useAsyncData('comment-authors', () =>
  gql<{ users: Array<{ id: string; name: string }> }>(QUERIES.users, { limit: 100 }),
)

const text = ref('')
const author = ref('1')

watchEffect(() => {
  const first = commentAuthors.value?.users[0]
  if (first) author.value = first.id
})

const {
  mutate: addComment,
  pending: sending,
  error: sendError,
} = useGqlMutation<{ createComment: { id: string } }>(MUTATIONS.createComment)

async function submitComment() {
  const result = await addComment({
    data: { text: text.value, author: author.value, post: id.value },
  })

  if (result) {
    text.value = ''
    await refresh()
  }
}

const {
  mutate: removeComment,
  pending: removing,
  error: removeError,
} = useGqlMutation<{ deleteComment: { id: string } }>(MUTATIONS.deleteComment)

async function deleteComment(commentId: string) {
  const result = await removeComment({ id: commentId })
  if (result) await refresh()
}
</script>

<template>
  <div class="stack">
    <NuxtLink to="/posts" class="small">← All posts</NuxtLink>

    <StatusBlock :error="error?.message" :loading="pending" />

    <div v-if="notFound" class="card stack">
      <h1 style="margin: 0">Post not found</h1>
      <p class="muted" style="margin: 0">
        No post with id <code>{{ id }}</code>. It may have been deleted.
      </p>
      <NuxtLink to="/posts" class="btn">Back to posts</NuxtLink>
    </div>

    <template v-else-if="data?.post">
      <article class="card stack">
        <div class="row">
          <h1 style="margin: 0">{{ data.post.title }}</h1>
          <span class="badge" :class="data.post.published ? 'badge-live' : 'badge-warn'">
            {{ data.post.published ? 'published' : 'draft' }}
          </span>
        </div>

        <p class="muted small" style="margin: 0">
          by {{ data.post.author?.name ?? 'unknown' }} · post&nbsp;#{{ data.post.id }}
        </p>

        <p style="margin: 0; white-space: pre-wrap">{{ data.post.body }}</p>
      </article>

      <section class="stack">
        <div class="row">
          <h2 style="margin: 0">Comments ({{ data.post.comments.length }})</h2>
          <span class="spacer" />
          <span class="badge" :class="liveStatus === 'live' ? 'badge-live' : 'badge-warn'">
            <span v-if="liveStatus === 'live'" class="dot dot-pulse" />
            {{ liveStatus === 'live' ? 'live' : liveStatus }}
          </span>
        </div>

        <div v-if="liveError" class="alert alert-error">{{ liveError }}</div>

        <!-- Live events pushed from the server appear here -->
        <div v-if="events.length" class="alert alert-empty small">
          <div v-for="(event, index) in events.slice(0, 3)" :key="index">
            <strong>{{ event.mutation }}</strong> — {{ event.author }}: {{ event.text }}
          </div>
        </div>

        <StatusBlock :empty="data.post.comments.length === 0" empty-text="No comments yet." />

        <div
          v-for="comment in data.post.comments"
          :key="comment.id"
          class="card row"
          style="align-items: flex-start"
        >
          <div class="stack" style="gap: 0.15rem; flex: 1">
            <span class="small">{{ comment.text }}</span>
            <span class="muted small">by {{ comment.author?.name ?? 'unknown' }}</span>
          </div>
          <button
            class="btn btn-danger small"
            :disabled="removing"
            @click="deleteComment(comment.id)"
          >
            Delete
          </button>
        </div>

        <form class="card stack" @submit.prevent="submitComment">
          <div class="field">
            <label class="label" for="text">Add a comment</label>
            <input id="text" v-model="text" class="input" required />
          </div>

          <div class="row">
            <div class="field" style="min-width: 180px">
              <label class="label" for="author">As</label>
              <select id="author" v-model="author" class="select">
                <option v-for="user in commentAuthors?.users ?? []" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            <span class="spacer" />
            <button class="btn btn-primary" type="submit" :disabled="sending">
              {{ sending ? 'Posting…' : 'Comment' }}
            </button>
          </div>

          <div v-if="sendError" class="alert alert-error">{{ sendError }}</div>
          <div v-if="removeError" class="alert alert-error">{{ removeError }}</div>
        </form>
      </section>
    </template>
  </div>
</template>
