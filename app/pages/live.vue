<script setup lang="ts">
/**
 * Live page: the subscription playground.
 *
 * Opens an SSE subscription to `post`, then gives you buttons that trigger the
 * corresponding mutations. Toggling a post's published flag produces CREATED or
 * DELETED events (that is the logic in the backend `updatePost` resolver), so
 * this page demonstrates the whole publish/unpublish state machine.
 */
const eventLog = ref<
  Array<{ at: string; mutation: string; id: string; title: string; published: boolean }>
>([])

const { status, error: liveError } = useGqlSubscription<any>(
  SUBSCRIPTIONS.post,
  {},
  (payload) => {
    eventLog.value.unshift({
      at: new Date().toLocaleTimeString(),
      mutation: payload.mutation,
      id: payload.data.id,
      title: payload.data.title,
      published: payload.data.published,
    })

    // Keep the log bounded so a long session cannot grow without limit.
    if (eventLog.value.length > 50) eventLog.value.length = 50
  },
)

const { data: posts, refresh } = await useAsyncData('live-posts', () =>
  gql<{ posts: Array<any> }>(QUERIES.posts, { limit: 50 }),
)

const { mutate: createPost, pending: creating } = useGqlMutation(MUTATIONS.createPost)

/**
 * The schema has no `publishPost` mutation, so flipping the flag goes through
 * the generic `updatePost`. Declared inline here rather than in documents.ts
 * because only this page needs it.
 */
const toggleMutation = `
  mutation TogglePublished($id: ID!, $data: UpdatePostInput!) {
    updatePost(id: $id, data: $data) { id title published }
  }
`

const { mutate: toggle, pending: toggling, error: toggleError } =
  useGqlMutation<{ updatePost: any }>(toggleMutation)

async function flip(post: { id: string; published: boolean }) {
  const result = await toggle({
    id: post.id,
    data: { published: !post.published },
  })

  if (result) await refresh()
}

const { data: users } = await useAsyncData('live-users', () =>
  gql<{ users: Array<{ id: string; name: string }> }>(QUERIES.users, { limit: 100 }),
)

const newPost = reactive({ title: '', body: '' })

async function createPublished() {
  const author = users.value?.users[0]
  if (!author) return

  const result = await createPost({
    data: {
      title: newPost.title || `Live post ${new Date().toLocaleTimeString()}`,
      body: newPost.body || 'Created from the live page.',
      published: true,
      author: author.id,
    },
  })

  if (result) {
    newPost.title = ''
    newPost.body = ''
    await refresh()
  }
}

const badgeFor = (mutation: string) =>
  mutation === 'CREATED' ? 'badge-live' : mutation === 'DELETED' ? 'badge-warn' : 'badge'
</script>

<template>
  <div class="stack">
    <div class="row">
      <h1 style="margin: 0">Live events</h1>
      <span class="spacer" />
      <span class="badge" :class="status === 'live' ? 'badge-live' : 'badge-warn'">
        <span v-if="status === 'live'" class="dot dot-pulse" />
        {{ status }}
      </span>
    </div>

    <p class="muted small" style="margin: 0">
      Open this page in two browser windows, then trigger a change below in one of
      them — both receive the event, because it is pushed from the server over SSE.
    </p>

    <div v-if="liveError" class="alert alert-error">{{ liveError }}</div>

    <section class="card stack">
      <h2 style="margin: 0">Trigger events</h2>

      <div class="row">
        <button class="btn btn-primary" :disabled="creating" @click="createPublished">
          + Create a published post
        </button>
      </div>

      <div class="stack" style="gap: 0.4rem">
        <span class="muted small">
          Toggle "published" on an existing post — unpublishing emits DELETED,
          re-publishing emits CREATED.
        </span>

        <div v-for="post in posts?.posts ?? []" :key="post.id" class="row" style="gap: 0.5rem">
          <span class="small" style="flex: 1">{{ post.title }}</span>
          <span class="badge" :class="post.published ? 'badge-live' : 'badge-warn'">
            {{ post.published ? 'published' : 'draft' }}
          </span>
          <button class="btn small" :disabled="toggling" @click="flip(post)">
            {{ post.published ? 'Unpublish' : 'Publish' }}
          </button>
        </div>
      </div>

      <div v-if="toggleError" class="alert alert-error">{{ toggleError }}</div>
    </section>

    <section class="stack">
      <div class="row">
        <h2 style="margin: 0">Event feed</h2>
        <span class="spacer" />
        <span class="muted small">{{ eventLog.length }} received</span>
        <button v-if="eventLog.length" class="btn small" @click="eventLog = []">Clear</button>
      </div>

      <StatusBlock
        :empty="eventLog.length === 0"
        empty-text="Waiting for events — trigger one above."
      />

      <TransitionGroup name="feed" tag="div" class="stack" style="gap: 0.5rem">
        <div v-for="event in eventLog" :key="`${event.at}-${event.id}-${event.mutation}`"
             class="card row">
          <span class="badge" :class="badgeFor(event.mutation)">{{ event.mutation }}</span>
          <span class="small" style="flex: 1">{{ event.title }}</span>
          <span class="badge" :class="event.published ? 'badge-live' : 'badge-warn'">
            {{ event.published ? 'published' : 'draft' }}
          </span>
          <span class="muted small">{{ event.at }}</span>
        </div>
      </TransitionGroup>
    </section>
  </div>
</template>

<style scoped>
.feed-enter-active,
.feed-leave-active {
  transition: all 0.25s ease;
}

.feed-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.feed-leave-to {
  opacity: 0;
}
</style>
