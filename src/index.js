const _ = require('lodash');
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
        useNewUrlParser: true,
      })
        .then( client => {
          Vars.client = client;
        })
        .catch( err => {
          fpm.logger.error('Mongodb Connect Error:', err);
        })

        _.extend(obj, {
          use: args => {
            Vars.db = Vars.client.db(args.dbname);
            return 1;
          },
          collection: args => {
            const { dbname = 'testDB', collection } = args;
            db = Vars.client.db(dbname);
            return db.collection(collection);
          },
          find: async args => {
            const { dbname = 'testDB', condition = {}, collection, limit = 0, skip = 0, sort = 'id-' } = args;
            db = Vars.client.db(dbname);
            const c = db.collection(collection);
            try {
              // split ',' the sort ; _id-,name+
              const sortArr = _.map(sort.split(','), item => {
                if(_.endsWith(item, '+')){
                  return  [ _.trimEnd(item, '+'), 1 ];
                }
                return [ _.trimEnd(item, '-'), -1 ];
              })
              const options = { limit, skip, sort: sortArr };
              const rows = await c.find(condition, options).toArray();
              return rows ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          first: async args => {
            const { dbname = 'testDB', condition = {}, collection, limit = 0, skip = 0, sort = 'id-' } = args;
            db = Vars.client.db(dbname);
            const c = db.collection(collection);
            try {
              // split ',' the sort ; _id-,name+
              const sortArr = _.map(sort.split(','), item => {
                if(_.endsWith(item, '+')){
                  return  [ _.trimEnd(item, '+'), 1 ];
                }
                return [ _.trimEnd(item, '-'), -1 ];
              })
              const options = { limit, skip, sort: sortArr };
              const data = await c.findOne(condition, options);
              return { data } ;
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
          batch: async args => {
            const { dbname = 'testDB', rows, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const { result } = await db.collection(collection).insertMany(rows);
              return result;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          save: async args => {
            const { dbname = 'testDB', id, row = {}, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const { result } = await db.collection(collection).updateOne({ _id: new ObjectID(id) }, { $set: row });
              if(result.n == 1){
                return result;
              }
              return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          update: async args => {
            const { dbname = 'testDB', condition = {}, row = {}, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const { result } = await db.collection(collection).updateMany(condition, { $set: row });
              return result;
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
                return result;
              }
              return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          clean: async args => {
            const { dbname = 'testDB', condition = {}, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const { result } = await db.collection(collection).deleteMany(condition);
              return result ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          get: async args => {
            const { dbname = 'testDB', id, collection } = args;
            db = Vars.client.db(dbname);
            try {
              const data = await db.collection(collection).findOne({ _id: new ObjectID(id)});
              if(data){
                return data;
              }
              return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
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
            try {
              const { count } = await obj.count(args);
              const rows = await obj.find(args);
              return { count, rows } ;
            } catch (error) {
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
        });
    });

    fpm.registerAction('BEFORE_SERVER_START', () => {
      fpm.extendModule('mongo', obj);
      fpm.MONGO = obj;
    })

    return obj;
  }
}
