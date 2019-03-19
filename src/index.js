const _ = require('lodash');
const { MongoClient, ObjectID } = require('mongodb');
const debug = require('debug')('plugin-mongo');

const makeProjection = projection => {
  if(projection == '*' || projection == ''){
    return;
  }else{
    if(_.isPlainObject(projection)){
      return projection;
    }else if(_.isString(projection)){
      const projectionObj = {};
      _.map(projection.split(','), p => {
        projectionObj[p] = 1;
      });
      return projectionObj;
    }
  }
}

const makeSort = sort => {
  // split ',' the sort ; _id-,name+
  return _.map(sort.split(','), item => {
    if(_.endsWith(item, '+')){
      return  [ _.trimEnd(item, '+'), 1 ];
    }
    return [ _.trimEnd(item, '-'), -1 ];
  })
}

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
        },
        default: 'testDB',
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
          if(config.default){
            Vars.db = client.db(config.default);
          }          
        })
        .catch( error => {
          debug('[Init] => Mongodb Connect Error: % O', error)
          fpm.logger.error('Mongodb Connect Error:', err);
        })

        _.extend(obj, {
          use: args => {
            Vars.db = Vars.client.db(args.dbname);
            return 1;
          },
          collection: args => {
            const { dbname, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            return db.collection(collection);
          },
          find: async args => {
            debug('[find] => Arguments: % O', args)
            // projection
            const { dbname, condition = {}, collection, limit = 0, skip = 0, sort = 'id-', fields = '*' } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            const c = db.collection(collection);
            try {
              const options = { limit, skip, sort: makeSort(sort) };
              const projection = makeProjection(args.projection || fields)
              if(projection){
                options.projection = projection;
              }
              const rows = await c.find(condition, options).toArray();
              return rows ;
            } catch (error) {
              debug('[find] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          first: async args => {
            debug('[first] => Arguments: % O', args)
            const { dbname, condition = {}, collection, limit = 0, skip = 0, sort = 'id-', fields = '*' } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            const c = db.collection(collection);
            try {
              const options = { limit, skip, sort: makeSort(sort) };
              const projection = makeProjection(args.projection || fields)
              if(projection){
                options.projection = projection;
              }
              const data = await c.findOne(condition, options);
              if(data == null){
                // find nothing
                return Promise.reject({ errno: -3, message: `Find Nothing By the Condition` });
              }
              return data ;
            } catch (error) {
              debug('[first] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          create: async args => {
            debug('[create] => Arguments: % O', args)
            const { dbname, row, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const { insertedId } = await db.collection(collection).insertOne(row);
              return Object.assign( row, { _id: insertedId });
            } catch (error) {
              debug('[create] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          batch: async args => {
            debug('[batch] => Arguments: % O', args)
            const { dbname, rows, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const { result } = await db.collection(collection).insertMany(rows);
              return result;
            } catch (error) {
              debug('[batch] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          save: async args => {
            debug('[save] => Arguments: % O', args)
            const { dbname, id, row = {}, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const { result } = await db.collection(collection).updateOne({ _id: new ObjectID(id) }, { $set: row });
              if(result.n == 1){
                return result;
              }
              return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
            } catch (error) {
              debug('[save] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          update: async args => {
            debug('[update] => Arguments: % O', args)
            const { dbname, condition = {}, row = {}, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const { result } = await db.collection(collection).updateMany(condition, { $set: row });
              return result;
            } catch (error) {
              debug('[update] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          remove: async args => {
            debug('[remove] => Arguments: % O', args)
            const { dbname, id, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const { result } = await db.collection(collection).deleteOne({ _id: new ObjectID(id)});
              if(result.n == 1){
                return result;
              }
              return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
            } catch (error) {
              debug('[remove] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          clean: async args => {
            debug('[clean] => Arguments: % O', args)
            const { dbname, condition = {}, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const { result } = await db.collection(collection).deleteMany(condition);
              return result ;
            } catch (error) {
              debug('[clean] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          get: async args => {
            debug('[get] => Arguments: % O', args)
            const { dbname, id, collection, fields = '*' } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const options = { };
              const projection = makeProjection(args.projection || fields)
              if(projection){
                options.projection = projection;
              }
              const data = await db.collection(collection).findOne({ _id: new ObjectID(id)}, options);
              if(data){
                return data;
              }
              return Promise.reject({ errno: -2, message: `ObjectID: ${ id } not existed` });
            } catch (error) {
              debug('[get] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          count: async args => {
            debug('[count] => Arguments: % O', args)
            const { dbname, condition = {}, collection } = args;
            const db = (dbname) ? Vars.client.db(dbname) : Vars.db;
            try {
              const data = await db.collection(collection).countDocuments(condition);
              return data ;
            } catch (error) {
              debug('[count] => ERROR: % O', error)
              return Promise.reject({ errno: -1, message: 'operate mongodb error', error });
            }
          },
          findAndCount: async args => {
            debug('[findAndCount] => Arguments: % O', args)
            try {
              const count = await obj.count(args);
              const rows = await obj.find(args);
              return { count, rows } ;
            } catch (error) {
              debug('[findAndCount] => ERROR: % O', error)
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
