<script setup lang="ts">
/**
 * Users list plus a create form.
 *
 * Demonstrates the `users(query:, limit:, offset:)` arguments and surfaces the
 * backend's unique-email guard: creating a duplicate email returns the GraphQL
 * error "Email already taken", which is shown inline rather than as a crash.
 */
const route = useRoute()
const router = useRouter()

const search = ref(String(route.query.q ?? ''))

const { data, error, pending, refresh } = await useAsyncData(
  () => `users-${search.value}`,
  () =>
    gql<{ users: Array<any> }>(QUERIES.users, {
      query: search.value || null,
      limit: 50,
    }),
)

// Single debounced refetch rather than a fetch per keystroke (see posts/index.vue).
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
const form = reactive({ name: '', email: '', age: '' })

const {
  mutate: createUser,
  pending: creating,
  error: createError,
} = useGqlMutation<{ createUser: { id: string } }>(MUTATIONS.createUser)

async function submit() {
  // `age` is optional: send null rather than an empty string, which would fail
  // GraphQL's Int coercion.
  const payload: Record<string, unknown> = {
    name: form.name,
    email: form.email,
    age: form.age === '' ? null : Number(form.age),
  }

  const result = await createUser({ data: payload })

  if (result) {
    showForm.value = false
    form.name = ''
    form.email = ''
    form.age = ''
    await refresh()
  }
}
</script>

<template>
  <div class="stack">
    <div class="row">
      <h1 style="margin: 0">Users</h1>
      <span class="spacer" />
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ New user' }}
      </button>
    </div>

    <form v-if="showForm" class="card stack" @submit.prevent="submit">
      <h2 style="margin: 0">New user</h2>

      <div class="field">
        <label class="label" for="name">Name</label>
        <input id="name" v-model="form.name" class="input" required />
      </div>

      <div class="field">
        <label class="label" for="email">Email</label>
        <input id="email" v-model="form.email" class="input" type="email" required />
      </div>

      <div class="field">
        <label class="label" for="age">Age <span class="muted">(optional)</span></label>
        <input id="age" v-model="form.age" class="input" type="number" min="0" max="150" />
      </div>

      <div v-if="createError" class="alert alert-error">{{ createError }}</div>

      <div class="row">
        <button class="btn btn-primary" type="submit" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create user' }}
        </button>
      </div>
    </form>

    <input
      v-model="search"
      class="input"
      type="search"
      placeholder="Search by name (case-insensitive)…"
      aria-label="Search users"
    />

    <StatusBlock
      :error="error?.message"
      :loading="pending"
      :empty="data?.users.length === 0"
      :empty-text="search ? `No users match “${search}”.` : 'No users yet.'"
    />

    <div class="grid">
      <NuxtLink
        v-for="user in data?.users ?? []"
        :key="user.id"
        :to="`/users/${user.id}`"
        class="card user-card"
      >
        <div class="row">
          <strong>{{ user.name }}</strong>
          <span class="spacer" />
          <span class="badge">{{ user.posts?.length ?? 0 }} posts</span>
        </div>
        <span class="muted small">{{ user.email }}</span>
        <span v-if="user.age !== null" class="muted small">age {{ user.age }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.user-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: var(--text);
}

.user-card:hover {
  border-color: var(--accent);
  text-decoration: none;
}
</style>
