import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from './entities/constants'
import express from 'express';
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from "path";



const main = async () => {
  // -------------- Connects Database ------------------------------
  const connect = await createConnection( {
    type: 'postgres',
    database: 'redditClone',
    username: 'postgres',
    password: 'postgres',
    logging: true, // shows executed SQL
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User]
  });

  // await connect.runMigrations();
  // await Post.delete({})

  // ------------------ Main Program --------------------------------
  const app = express();
  
  // -- Session middleware must run before Apollo middlware
  const RedisStore = connectRedis(session);
  const redis = new Redis() 

  const TWO_HOURS = 1000 * 60 * 60 * 2 // cookieAge Two Hours

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));

  app.use(
    session({
      name: COOKIE_NAME, 
      store: new RedisStore({ 
        client: redis,
        disableTouch: true  // persist data on user activity (See docs:)
       }),
       cookie: {
         maxAge: TWO_HOURS,
         httpOnly: true, // disables access to cookie via client
         sameSite: 'lax', // csrf
         secure: __prod__// cookie only works in https
        },
        secret: 'keyboard cat', // ideally this is a longer string that is hidden in env
        resave: false,
        saveUninitialized: false // Does not store empty sessions
    })
  )
  // --------------------------------------------------------------------
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false
    }),
    // special object that is accesible by all resolvers
    // passing req, res into context allows access from resolvers
    context: ({req, res}) => ({ req, res, redis })
  })
  
  
  apolloServer.applyMiddleware({ 
    app, 
    cors: false // Cors is set through express
  }); 
  

  app.get('/', (_, res) => {
    res.send('Hello world')
  })
  app.listen(5000, () => {
    console.log('Server started on PORT 5000')
  })
  // ---------------------------------------------------------------
};

main().catch((err) => {
  console.log(err)
});


// adding random comment because git is being so annoying