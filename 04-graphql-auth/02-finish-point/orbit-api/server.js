require("dotenv").config();
const jwtDecode = require("jwt-decode");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dashboardData = require("./data/dashboard");
const User = require("./data/User");
const InventoryItem = require("./data/InventoryItem");

const {
  ApolloServer,
  gql,
  ApolloError,
  AuthenticationError,
  UserInputError,
} = require("apollo-server");
const { SchemaDirectiveVisitor } = require("graphql-tools");
const { defaultFieldResolver } = require("graphql");

const { createToken, hashPassword, verifyPassword } = require("./util");

const checkUserRole = (user, allowableRoles) => {
  if (!user || !allowableRoles.includes(user.role)) {
    throw new AuthenticationError("Not authorized");
  }
  return true;
};

const typeDefs = gql`
  directive @auth(requires: [Role] = [ADMIN]) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
  }

  type Sale {
    date: String!
    amount: Int!
  }

  type DashboardData {
    salesVolume: Int!
    newCustomers: Int!
    refunds: Int!
    graphData: [Sale!]!
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    avatar: String
    bio: String
  }

  type InventoryItem {
    _id: ID!
    user: String!
    name: String!
    itemNumber: String!
    unitPrice: String!
    image: String!
  }

  type AuthenticationResult {
    message: String!
    userInfo: User!
    token: String!
    expiresAt: String!
  }

  type InventoryItemResult {
    message: String!
    inventoryItem: InventoryItem
  }

  type UserUpdateResult {
    message: String!
    user: User!
  }

  type UserBioUpdateResult {
    message: String!
    userBio: UserBio!
  }

  type UserBio {
    bio: String!
  }

  type Query {
    dashboardData: DashboardData @auth(requires: [USER, ADMIN])
    users: [User] @auth(requires: ADMIN)
    user: User @auth(requires: [USER, ADMIN])
    inventoryItems: [InventoryItem] @auth(requires: ADMIN)
    userBio: UserBio @auth(requires: [USER, ADMIN])
  }

  type Mutation {
    login(email: String!, password: String!): AuthenticationResult
    signup(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): AuthenticationResult
    addInventoryItem(
      name: String!
      itemNumber: String!
      unitPrice: Float!
    ): InventoryItemResult @auth(requires: ADMIN)
    deleteInventoryItem(id: ID!): InventoryItemResult @auth(requires: ADMIN)
    updateUserRole(role: String!): UserUpdateResult
      @auth(requires: [USER, ADMIN])
    updateUserBio(bio: String!): UserBioUpdateResult
      @auth(requires: [USER, ADMIN])
  }
`;
require("dotenv").config();
const jwtDecode = require("jwt-decode");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dashboardData = require("./data/dashboard");
const User = require("./data/User");
const InventoryItem = require("./data/InventoryItem");

const {
  ApolloServer,
  gql,
  ApolloError,
  AuthenticationError,
  UserInputError,
} = require("apollo-server");
const { SchemaDirectiveVisitor } = require("graphql-tools");
const { defaultFieldResolver } = require("graphql");

const { createToken, hashPassword, verifyPassword } = require("./util");

const checkUserRole = (user, allowableRoles) => {
  if (!user || !allowableRoles.includes(user.role)) {
    throw new AuthenticationError("Not authorized");
  }
  return true;
};

const resolvers = {
  Query: {
    dashboardData: (parent, args, context) => {
      // checkUserRole(context.user, ['user', 'admin']);
      return dashboardData;
    },
    users: async (parent, args, context) => {
      // checkUserRole(context.user, ['admin']);
      try {
        return await User.find()
          .lean()
          .select("_id firstName lastName avatar bio");
      } catch (err) {
        return err;
      }
    },
    user: async (parent, args, context) => {
      // checkUserRole(context.user, ['user', 'admin']);
      try {
        const { user } = context;
        return await User.findOne({ _id: user.sub })
          .lean()
          .select("_id firstName lastName role avatar bio");
      } catch (err) {
        return err;
      }
    },
    inventoryItems: async (parent, args, context) => {
      // checkUserRole(context.user, ['admin']);
      try {
        const { user } = context;
        return await InventoryItem.find({
          user: user.sub,
        });
      } catch (err) {
        return err;
      }
    },
    userBio: async (parent, args, context) => {
      // checkUserRole(context.user, ['user', 'admin']);
      try {
        const { user } = context;
        const foundUser = await User.findOne({
          _id: user.sub,
        })
          .lean()
          .select("bio");

        return { bio: foundUser.bio };
      } catch (err) {
        return err;
      }
    },
  },
};

const typeDefs = gql`
  directive @auth(requires: [Role] = [ADMIN]) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
  }

  type Sale {
    date: String!
    amount: Int!
  }

  type DashboardData {
    salesVolume: Int!
    newCustomers: Int!
    refunds: Int!
    graphData: [Sale!]!
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    avatar: String
    bio: String
  }

  type InventoryItem {
    _id: ID!
    user: String!
    name: String!
    itemNumber: String!
    unitPrice: String!
    image: String!
  }

  type AuthenticationResult {
    message: String!
    userInfo: User!
    token: String!
    expiresAt: String!
  }

  type InventoryItemResult {
    message: String!
    inventoryItem: InventoryItem
  }

  type UserUpdateResult {
    message: String!
    user: User!
  }

  type UserBioUpdateResult {
    message: String!
    userBio: UserBio!
  }

  type UserBio {
    bio: String!
  }

  type Query {
    dashboardData: DashboardData @auth(requires: [USER, ADMIN])
    users: [User] @auth(requires: ADMIN)
    user: User @auth(requires: [USER, ADMIN])
    inventoryItems: [InventoryItem] @auth(requires: ADMIN)
    userBio: UserBio @auth(requires: [USER, ADMIN])
  }

  type Mutation {
    login(email: String!, password: String!): AuthenticationResult
    signup(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): AuthenticationResult
    addInventoryItem(
      name: String!
      itemNumber: String!
      unitPrice: Float!
    ): InventoryItemResult @auth(requires: ADMIN)
    deleteInventoryItem(id: ID!): InventoryItemResult @auth(requires: ADMIN)
    updateUserRole(role: String!): UserUpdateResult
      @auth(requires: [USER, ADMIN])
    updateUserBio(bio: String!): UserBioUpdateResult
      @auth(requires: [USER, ADMIN])
  }
`;
