<script setup lang="ts">
/**
 * App shell: a persistent header plus the routed page.
 * Individual pages handle their own data fetching.
 */
const route = useRoute()

const links = [
  { to: '/', label: 'Home' },
  { to: '/posts', label: 'Posts' },
  { to: '/users', label: 'Users' },
  { to: '/live', label: 'Live' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div>
    <header class="site-header">
      <div class="header-inner">
        <NuxtLink to="/" class="brand">
          <span class="brand-mark">◈</span>
          <span>GraphQL Basics</span>
        </NuxtLink>

        <nav class="nav">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ active: isActive(link.to) }"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

.brand-mark {
  color: var(--accent);
}

.nav {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.nav-link {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.9rem;
  color: var(--text-dim);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover {
  color: var(--text);
  background: var(--surface-2);
  text-decoration: none;
}

.nav-link.active {
  color: var(--bg);
  background: var(--accent);
  font-weight: 600;
}
</style>
