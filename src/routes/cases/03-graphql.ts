import { Router } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull } from "graphql";

interface Book {
  id: string;
  title: string;
  author: string;
}

const books: Book[] = [
  { id: "1", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann" },
  { id: "2", title: "Clean Architecture", author: "Robert C. Martin" }
];

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    author: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    books: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(BookType))),
      resolve: () => books
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addBook: {
      type: new GraphQLNonNull(BookType),
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (_source, args) => {
        const typedArgs = args as { title: string; author: string };
        const book: Book = {
          id: String(books.length + 1),
          title: typedArgs.title,
          author: typedArgs.author
        };
        books.push(book);
        return book;
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

export const case03GraphqlRouter = Router();

case03GraphqlRouter.use(
  "/",
  graphqlHTTP({
    schema,
    graphiql: true
  })
);
