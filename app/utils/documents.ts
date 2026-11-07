/**
 * Shared GraphQL documents.
 *
 * Kept in one module so the field selections stay in sync between the pages
 * that read data and the mutations that write it. A fragment would be the
 * textbook answer; plain string constants are easier to read when teaching.
 */

export const USER_FIELDS = `
  id
  name
  email
  age
`

export const POST_FIELDS = `
  id
  title
  body
  published
  author { id name }
  comments { id text author { id name } }
`

export const QUERIES = {
  users: `
    query Users($query: String, $limit: Int, $offset: Int) {
      users(query: $query, limit: $limit, offset: $offset) {
        ${USER_FIELDS}
        posts { id title }
      }
    }
  `,

  user: `
    query User($id: ID!) {
      user(id: $id) {
        ${USER_FIELDS}
        posts { id title published }
        comments { id text post { id title } }
      }
    }
  `,

  posts: `
    query Posts($query: String, $limit: Int, $offset: Int) {
      posts(query: $query, limit: $limit, offset: $offset) {
        ${POST_FIELDS}
      }
    }
  `,

  // Dashboard counts. Deliberately relation-free: the old dashboard fetched
  // users with `posts { id title }` attached, which dragged every post title
  // into the SSR payload just to read `.length`.
  counts: `
    query Counts {
      userCount
      postCount
      commentCount
    }
  `,

  recentPosts: `
    query RecentPosts($limit: Int) {
      posts(limit: $limit) {
        ${POST_FIELDS}
      }
    }
  `,

  post: `
    query Post($id: ID!) {
      post(id: $id) {
        ${POST_FIELDS}
      }
    }
  `,

  me: `
    query Me {
      me { ${USER_FIELDS} }
    }
  `,
}

export const MUTATIONS = {
  createUser: `
    mutation CreateUser($data: CreateUserInput!) {
      createUser(data: $data) { ${USER_FIELDS} }
    }
  `,

  createPost: `
    mutation CreatePost($data: CreatePostInput!) {
      createPost(data: $data) { ${POST_FIELDS} }
    }
  `,

  createComment: `
    mutation CreateComment($data: CreateCommentInput!) {
      createComment(data: $data) {
        id
        text
        author { id name }
      }
    }
  `,

  deletePost: `
    mutation DeletePost($id: ID!) {
      deletePost(id: $id) { id title }
    }
  `,

  deleteComment: `
    mutation DeleteComment($id: ID!) {
      deleteComment(id: $id) { id text }
    }
  `,
}

export const SUBSCRIPTIONS = {
  post: `
    subscription OnPost {
      post {
        mutation
        data { id title body published author { id name } }
      }
    }
  `,

  comment: `
    subscription OnComment($postId: ID!) {
      comment(postId: $postId) {
        mutation
        data { id text author { id name } }
      }
    }
  `,
}
