const users = [
  {
    id: "1",
    name: "Rogers",
    email: "rogers@microskills.ac.tz",
    age: 45,
  },
  {
    id: "2",
    name: "Senny",
    email: "senny@microskills.ac.tz",
  },
  {
    id: "3",
    name: "Kalibwanyigi",
    email: "kali@microskills.ac.tz",
  },
];

const posts = [
  {
    id: "10",
    title: "GraphQL 101",
    body: "This is how you use GraphQL ...",
    published: true,
    author: "1",
  },
  {
    id: "11",
    title: "GraphQL 201",
    body: "This is how you use an advanced GraphQL ...",
    published: false,
    author: "1",
  },
  {
    id: "12",
    title: "Programming music 101",
    body: "This is how you program music ...",
    published: true,
    author: "2",
  },
];

const comments = [
  {
    id: "102",
    text: "This worked well for me! Thanks.",
    author: "3",
    post: "10",
  },
  {
    id: "103",
    text: "Glad you enjoyed it.",
    author: "1",
    post: "10",
  },
  {
    id: "104",
    text: "This did not work",
    author: "2",
    post: "11",
  },
  {
    id: "105",
    text: "Never mind, I got it to work",
    author: "1",
    post: "11",
  },
];

const db = { users, posts, comments };

export default db;