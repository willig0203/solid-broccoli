const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // identify user by JWT
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("savedBooks");
        // .populate("authers");
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
    // get all users
    users: async () => {
      const userData = await User.find()
        .select("-__v -password")
        .populate("savedBooks");
      //   .populate("authors")
      return userData;
    },
    // get a user by username
    user: async (parent, { username }) => {
      const userData = await User.findOne({ username })
        .select("-__v -password")
        .populate("savedBooks");
      // .populate("authers");
      return userData;
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
  },
};

module.exports = resolvers;
