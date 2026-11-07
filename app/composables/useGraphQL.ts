/**
 * Thin GraphQL client used by every page.
 *
 * The browser talks to `/graphql` on the Nuxt origin, which Nitro proxies to
 * the Yoga server (see nuxt.config.ts). During SSR there is no origin to
 * resolve, so the absolute backend URL is used instead. Keeping this in one
 * place means no component ever has to think about it.
 */

export class GraphQLError extends Error {
  constructor(message: string, public details: unknown = null) {
    super(message)
    this.name = 'GraphQLError'
  }
}

function endpoint(): string {
  const config = useRuntimeConfig()
  return import.meta.server ? config.graphqlEndpoint : '/graphql'
}

async function request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
  } catch (error) {
    throw new GraphQLError(
      'Cannot reach the GraphQL server. Is it running on port 4000?',
      error,
    )
  }

  const payload = await response.json().catch(() => null)

  // GraphQL errors arrive with HTTP 200, so the body has to be inspected
  // rather than the status code.
  if (payload?.errors?.length) {
    throw new GraphQLError(payload.errors[0].message, payload.errors)
  }

  if (!response.ok) {
    throw new GraphQLError(`Request failed with HTTP ${response.status}`)
  }

  return payload.data as T
}

/**
 * Raw single request. Use this when several queries should run together inside
 * one `useAsyncData` (e.g. Promise.all on the dashboard) rather than one call
 * per query.
 */
export function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  return request<T>(query, variables)
}

/** Mutation helper: exposes pending/error state so buttons can disable. */
export function useGqlMutation<T>(query: string) {
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function mutate(variables: Record<string, unknown> = {}): Promise<T | null> {
    pending.value = true
    error.value = null

    try {
      return await request<T>(query, variables)
    } catch (exception) {
      error.value = exception instanceof Error ? exception.message : String(exception)
      return null
    } finally {
      pending.value = false
    }
  }

  return { mutate, pending, error }
}

export interface SubscriptionPayload<T> {
  mutation: 'CREATED' | 'UPDATED' | 'DELETED'
  data: T
}

/**
 * Live subscription over Server-Sent Events.
 *
 * Yoga serves subscriptions on the same `/graphql` URL using the SSE transport,
 * which the browser's built-in EventSource can consume directly — no extra
 * client library, no WebSocket connection. The query travels as a GET
 * parameter because EventSource cannot send a request body.
 */
export function useGqlSubscription<T>(
  query: string,
  variables: Record<string, unknown>,
  onEvent: (payload: SubscriptionPayload<T>) => void,
) {
  const connected = ref(false)
  const status = ref<'idle' | 'connecting' | 'live' | 'error'>('idle')
  const error = ref<string | null>(null)

  let source: EventSource | null = null
  let closed = false

  function url(): string {
    const base = import.meta.server ? '' : window.location.origin
    const params = new URLSearchParams({
      query,
      variables: JSON.stringify(variables),
    })

    return `${base}/graphql?${params.toString()}`
  }

  function connect() {
    if (closed) return

    status.value = 'connecting'
    source = new EventSource(url())

    source.addEventListener('next', (event) => {
      connected.value = true
      status.value = 'live'
      error.value = null

      try {
        const body = JSON.parse((event as MessageEvent).data)

        if (body.errors?.length) {
          error.value = body.errors[0].message
          status.value = 'error'
          return
        }

        if (body.data) onEvent(body.data as SubscriptionPayload<T>)
      } catch {
        error.value = 'Malformed subscription event'
      }
    })

    source.addEventListener('error', () => {
      connected.value = false

      // EventSource retries on its own for network blips; a closed stream means
      // the server rejected the subscription (e.g. "Post not found"), so show
      // that instead of spinning forever.
      if (source?.readyState === EventSource.CLOSED) {
        status.value = 'error'
        error.value ??= 'Subscription closed by the server'
      } else {
        status.value = 'connecting'
      }
    })
  }

  onMounted(connect)

  onBeforeUnmount(() => {
    closed = true
    source?.close()
    source = null
  })

  return { connected, status, error }
}
