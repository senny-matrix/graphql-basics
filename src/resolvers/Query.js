
const Query = {

    users(parent, args, {db}, info) {
      if (!args.query) {
        return db.users;
      }

      return db.users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts(parent, args, {db}, info) {
      if (!args.query) return db.posts;
      return db.posts.filter((post) => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());

        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());

        return isTitleMatch || isBodyMatch;
      });
    },
    comments: (parent, args, {db}, info) => {
      return db.comments;
    },
    me() {
      return {
        id: "123-abc",
        name: "Rogers Aaron",
        email: "rogers@microskills.ac.tz",
        age: 39,
      };
    },
    post() {
      return {
        id: "345-abc",
        title: "GraphQL 101",
        body: "A training about GraphQL for beginners",
        published: false,
        author: "1",
      };
    },
  };

export default Query;