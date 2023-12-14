const {pool} = require('../services/configs');

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } = require('graphql');


const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    address: { type: GraphQLString },
    gender: { type: GraphQLString },
    religion: { type: GraphQLString },
    phone: { type: GraphQLString },
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    users: {
      type: GraphQLList(UserType),
      resolve: async () => {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
      }
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve: async (_, { id }) => {
        try {
          const [row] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
          return row[0];
          
        } catch (error) {
          console.error('Error inserting user:', error);
          throw error;
        }
      }
    }
  }
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      resolve: async (_, { name, email, address, gender, religion, phone }) => {
        const [result] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email, address, gender, religion, phone]);
        const id = result.insertId;
        return { id, name, email, address, gender, religion, phone };
      }
    }
  }
});


const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});

module.exports = { schema };