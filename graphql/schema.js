const {pool} = require('../services/configs');

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLID } = require('graphql');


const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    address: { type: GraphQLString },
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
        email: { type: GraphQLString },
        address: { type: GraphQLString },
        religion: { type: GraphQLString },
        phone: { type: GraphQLString },
      },
      resolve: async (_, {name, email, address, religion, phone }) => {
        const [result] = await pool.query(
          'INSERT INTO users (name, email, address, religion, phone) VALUES (?, ?, ?, ?, ?)',
          [
            name,
            email,
            address,
            religion,
            phone
          ]);
        const ID = result.insertId;
        
        return { id: ID, name, email, address, religion, phone };
      }
    },
    updateUser: {
      type: UserType,
      args: {
        userId: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: GraphQLString },
        religion: { type: GraphQLString },
        phone: { type: GraphQLString },
      },
      resolve: async (_, { userId, name, email, address, religion, phone }) => {
        try {
          const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ?, address = ?, religion = ?, phone = ? WHERE id = ?',
            [name, email, address, religion, phone, userId]
          );

          if (result.affectedRows > 0) {
            return { id: userId, name, email, address, religion, phone };
          } else {
            throw new Error('User not found');
          }
        } catch (error) {
          throw new Error(`Failed to update user: ${error.message}`);
        }
      },
    },
    deleteUser: {
      type: GraphQLString,
      args:{
        userId: { type: GraphQLID }
      },
      resolve: async (_, { userId }) => {
        try {
          const result = await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    
          if (result[0].affectedRows > 0) {
            return "User deleted successfully";
          } else {
            throw new Error("User not found");
          }
        } catch (error) {
          throw new Error(`Failed to delete user: ${error.message}`);
        }
      }
    }
  }
});


const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});

module.exports = { schema };