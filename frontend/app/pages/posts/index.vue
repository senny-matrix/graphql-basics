<script setup lang="ts">
/**
 * Post list: server-side search, create, delete.
 *
 * Data loading uses one `useAsyncData` whose variables come from `search`, so
 * there is a single source of truth for "what is on screen". The search term is
 * mirrored into the URL so a filtered view survives a reload and can be shared.
 *
 * Note the destructuring of the mutation composables: the refs are pulled out to
 * top-level bindings so Vue unwraps them in the template. `mutation.pending`
 * inside a template would stay a Ref object and always look truthy.
 */
const route = useRoute()
const router = useRouter()

const search = ref(String(route.query.q ?? ''))

const { data, error, pending, refresh } = await useAsyncData(
  'posts',
  () =>
    gql<{ posts: Array<any> }>(QUERIES.posts, {
      query: search.value || null,
      limit: 50,
    }),
)

// Debounce typing: `refresh()` only fires once the user pauses, so a five-letter
// search issues one request instead of five. `watch: [search]` on useAsyncData
// would refetch on every keystroke, which is why it is deliberately not used.
let debounce: ReturnType<typeof setTimeout> | null = null
watch(search, (value) => {
  if (debounce) clearTimeout(debounce)

  debounce = setTimeout(() => {
    router.replace({ query: value ? { q: value } : {} })
    refresh()
  }, 300)
})

// --- create --------------------------------------------------------------
const showForm = ref(false)
const form = reactive({ title: '', body: '', published: true, author: '1' })

const {
  mutate: createPost,
  pending: creating,
  error: createError,
} = useGqlMutation<{ createPost: { id: string } }>(MUTATIONS.createPost)

const { data: userPicker } = await useAsyncData('post-author-picker', () =>
  gql<{ users: Array<{ id: string; name: string }> }>(QUERIES.users, { limit: 100 }),
)

// Default the author dropdown to a real row once the list arrives.
watchEffect(() => {
  const first = userPicker.value?.users[0]
  if (first && !userPicker.value?.users.some((user) => user.id === form.author)) {
    form.author = first.id
  }
})

async function submit() {
  const result = await createPost({ data: { ...form } })

  if (result) {
    showForm.value = false
    form.title = ''
    form.body = ''
    await refresh()
  }
}

// --- delete --------------------------------------------------------------
const {
  mutate: deletePost,
  pending: deleting,
  error: deleteError,
} = useGqlMutation<{ deletePost: { id: string } }>(MUTATIONS.deletePost)

async function remove(id: string, title: string) {
  if (!confirm(`Delete "${title}"? Its comments are deleted too.`)) return

  const result = await deletePost({ id })

  if (result) await refresh()
}
</script>

<template>
  <div class="stack">
    <div class="row">
      <h1 style="margin: 0">Posts</h1>
      <span class="spacer" />
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ New post' }}
      </button>
    </div>

    <!-- Create -->
    <form v-if="showForm" class="card stack" @submit.prevent="submit">
      <h2 style="margin: 0">New post</h2>

      <div class="field">
        <label class="label" for="title">Title</label>
        <input id="title" v-model="form.title" class="input" required />
      </div>

      <div class="field">
        <label class="label" for="body">Body</label>
        <textarea id="body" v-model="form.body" class="textarea" required />
      </div>

      <div class="row" style="align-items: flex-end">
        <div class="field" style="min-width: 200px">
          <label class="label" for="author">Author</label>
          <select id="author" v-model="form.author" class="select">
            <option v-for="user in userPicker?.users ?? []" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <label class="row small" style="gap: 0.4rem; padding-bottom: 0.6rem">
          <input v-model="form.published" type="checkbox" />
          Publish immediately
        </label>
      </div>

      <div v-if="createError" class="alert alert-error">{{ createError }}</div>

      <div class="row">
        <button class="btn btn-primary" type="submit" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create post' }}
        </button>
      </div>
    </form>

    <!-- Search -->
    <input
      v-model="search"
      class="input"
      type="search"
      placeholder="Search title or body (case-insensitive)…"
      aria-label="Search posts"
    />

    <StatusBlock
      :error="error?.message ?? deleteError"
      :loading="pending"
      :empty="data?.posts.length === 0"
      :empty-text="search ? `No posts match “${search}”.` : 'No posts yet — create one above.'"
    />

    <div class="stack">
      <div v-for="post in data?.posts ?? []" :key="post.id" class="stack" style="gap: 0.4rem">
        <PostCard :post="post" />
        <div class="row">
          <span class="spacer" />
          <button
            class="btn btn-danger small"
            :disabled="deleting"
            @click="remove(post.id, post.title)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
