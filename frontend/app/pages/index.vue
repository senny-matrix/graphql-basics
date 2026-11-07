<script setup lang="ts">
/**
 * Home: a dashboard.
 *
 * Counts come from dedicated aggregate fields (`userCount`, `postCount`,
 * `commentCount`) rather than from fetching every row and reading `.length`.
 * That keeps the SSR payload small: previously the user query asked for
 * `posts { id title }` on each user, so every post title was serialised into
 * the HTML just to compute a number.
 *
 * The two requests are independent, so they still run concurrently.
 */
const { data, error, pending } = await useAsyncData('home', async () => {
  const [counts, recent] = await Promise.all([
    gql<{ userCount: number; postCount: number; commentCount: number }>(
      QUERIES.counts,
    ),
    gql<{ posts: Array<any> }>(QUERIES.recentPosts, { limit: 3 }),
  ])

  return {
    userCount: counts.userCount,
    postCount: counts.postCount,
    commentCount: counts.commentCount,
    recent: recent.posts,
  }
})
</script>

<template>
  <div class="stack">
    <section class="hero card">
      <h1>GraphQL Basics</h1>
      <p class="muted" style="margin: 0">
        A small Nuxt app talking to a Yoga&nbsp;+&nbsp;Prisma&nbsp;+&nbsp;Postgres backend over a
        single <code>/graphql</code> endpoint.
      </p>

      <div class="row" style="margin-top: 1rem">
        <NuxtLink to="/posts" class="btn btn-primary">Browse posts</NuxtLink>
        <NuxtLink to="/live" class="btn">
          <span class="dot dot-pulse" style="color: var(--accent)" />
          Watch live events
        </NuxtLink>
      </div>
    </section>

    <StatusBlock :error="error?.message" :loading="pending" />

    <template v-if="data">
      <div class="stats">
        <div class="card stat">
          <span class="stat-value">{{ data.userCount }}</span>
          <span class="muted small">users</span>
        </div>
        <div class="card stat">
          <span class="stat-value">{{ data.postCount }}</span>
          <span class="muted small">posts</span>
        </div>
        <div class="card stat">
          <span class="stat-value">{{ data.commentCount }}</span>
          <span class="muted small">comments</span>
        </div>
      </div>

      <section class="stack">
        <div class="row">
          <h2 style="margin: 0">Recent posts</h2>
          <span class="spacer" />
          <NuxtLink to="/posts" class="small">See all →</NuxtLink>
        </div>

        <StatusBlock :empty="data.recent.length === 0" empty-text="No posts yet." />

        <PostCard v-for="post in data.recent" :key="post.id" :post="post" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--accent) 12%, var(--surface)),
    var(--surface) 55%
  );
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.1;
}
</style>
