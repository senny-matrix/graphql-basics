// Seeds the database with the same records that used to be hardcoded in src/db.js,
// so switching the resolvers over to Prisma does not change any API responses.
//
// Run with: npm run db:seed
import prisma from "../src/prisma.js";

async function main() {
  // Order matters: children before parents, because of the foreign keys.
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Explicit ids keep the data identical to the old in-memory arrays
  // (users 1-3, posts 10-12, comments 102-105).
  await prisma.user.createMany({
    data: [
      { id: 1, name: "Rogers", email: "rogers@microskills.ac.tz", age: 45 },
      { id: 2, name: "Senny", email: "senny@microskills.ac.tz", age: null },
      { id: 3, name: "Kalibwanyigi", email: "kali@microskills.ac.tz", age: null },
    ],
  });

  await prisma.post.createMany({
    data: [
      { id: 10, title: "GraphQL 101", body: "This is how you use GraphQL ...", published: true, authorId: 1 },
      { id: 11, title: "GraphQL 201", body: "This is how you use an advanced GraphQL ...", published: false, authorId: 1 },
      { id: 12, title: "Programming music 101", body: "This is how you program music ...", published: true, authorId: 2 },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { id: 102, text: "This worked well for me! Thanks.", authorId: 3, postId: 10 },
      { id: 103, text: "Glad you enjoyed it.", authorId: 1, postId: 10 },
      { id: 104, text: "This did not work", authorId: 2, postId: 11 },
      { id: 105, text: "Never mind, I got it to work", authorId: 1, postId: 11 },
    ],
  });

  // createMany() with explicit ids does not advance the SERIAL sequences,
  // so the next auto-generated id would collide. Push each sequence past the max.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"User"', 'id'),    (SELECT COALESCE(MAX(id), 1) FROM "User"))`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Post"', 'id'),    (SELECT COALESCE(MAX(id), 1) FROM "Post"))`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Comment"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "Comment"))`
  );

  const [users, posts, comments] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
  ]);

  console.log(`Seeded ${users} users, ${posts} posts, ${comments} comments.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
