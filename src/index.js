const _ = require('lodash');
// const Promise = require('bluebird');
const { MongoClient, ObjectID } = require('mongodb');

module.exports = {
  bind: (fpm) => {

    let obj = {};
    const Vars = { };
    // Run When Server Init
    fpm.registerAction('INIT', () => {
      const config = fpm.getConfig('mongodb', {
        host: 'localhost',
        port: 27017,
        poolSize: 5,
        auth: {
          user: 'admin',
          password: 'admin',
        }
      })
      MongoClient.connect(`mongodb://${ config.auth.user }:${ config.auth.password }@${ config.host }:${ config.port }`, {
        poolSize: config.poolSize || 5,
        auto_reconnect: true,
        socketTimeoutMS: 500,
        numberOfRetries: 3,
        retryMiliSeconds: 500,
        useNewUrlParser: true
        // auth: config.auth,
      })
        .then( client => {
          
          Vars.client = client;
        })
        .catch( err => {
          console.error(err);
        })

        _.extend(obj, {
          use: async args => {
            Vars.db = Vars.client.db(args.dbname);
            return 1;    
          },
          find: async args => {
    
            return 1;
          },
          first: async args => {
            const { dbname = 'testDB', condition = {}, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const data = await db.collection(collection).findOne(condition);
              return data ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          create: async args => {
            const { dbname = 'testDB', row, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const { insertedId } = await db.collection(collection).insertOne(row);
              return Object.assign( row, { _id: insertedId });
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          remove: async args => {
            const { dbname = 'testDB', id, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const { result } = await db.collection(collection).deleteOne({ _id: new ObjectID(id)});
              if(result.n == 1){
                return 1;
              }else{
                return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
              }
              return data ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          clean: async args => {
            return 1;
          },
          get: async args => {
            const { dbname = 'testDB', id, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const data = await db.collection(collection).findOne({ _id: new ObjectID(id)});
              return data ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          count: async args => {
            const { dbname = 'testDB', condition = {}, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const data = await db.collection(collection).estimatedDocumentCount(condition);
              return { count: data } ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          findAndCount: async args => {
            return 1;
          },
        });
    });
    
    
    fpm.registerAction('BEFORE_SERVER_START', () => {
      
    })

    return obj;
  }
}
