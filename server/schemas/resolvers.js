const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // identify user by JWT
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        // .populate("savedBooks");
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
    // get all users
    users: async () => {
      const userData = await User.find().select("-__v -password");
      // .populate("savedBooks");
      return userData;
    },
    // get a user by username
    user: async (parent, { username }) => {
      const userData = await User.findOne({ username }).select(
        "-__v -password"
      );
      // .populate("savedBooks");
      return userData;
    },
  },

  Mutation: {
    // addUser(username: String!, email: String!, password: String!): Auth
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
      // TODO: should be logged in after this but instead have to login!
    },

    // login(email: String!, password: String!): Auth
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

    // saveBook(bookData: saveBookInput): User
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const savedBook = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );

        return savedBook;
      }
      throw new AuthenticationError("You need to be logged in");
    },

    // removeBook(bookId: String!): User
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const removeBook = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } }
        );

        return removeBook;
      }
      throw new AuthenticationError("You need to be logged in");
    },
  },
};

module.exports = resolvers;
