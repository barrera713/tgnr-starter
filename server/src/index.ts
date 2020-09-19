import { __prod__ } from './entities/constants'
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';



const main = async () => {
  // -------------- Connects Database ------------------------------
  const orm = await MikroORM.init(mikroConfig); // connects database
  // only runs migrations for tables that have NOT been migrated
  await orm.getMigrator().up(); 
  //----------------------------------------------------------------
  
  // ------------------ Main Program --------------------------------
  const app = express();
  
  // -- Session middleware must run before Apollo middlware
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient()

  const TWO_HOURS = 1000 * 60 * 60 * 2 // cookieAge Two Hours

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));

  app.use(
    session({
      name: 'qid', 
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true  // persist data on user activity (See docs:)
       }),
       cookie: {
         maxAge: TWO_HOURS,
         httpOnly: true, // disables access to cookie via client
         sameSite: 'lax', // csrf
         secure: __prod__// cookie only works in https
        },
        secret: 'keyboard cat',
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
    context: ({req, res}) => ({ em: orm.em, req, res })
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