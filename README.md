## FPM-PLUGIN-MONGODB
用于操作 mongodb 的插件

### Install
```bash
npm add fpm-plugin-mongo --save
```

### Useage

- config
  ```javascript
  {
    //
    "mongodb": {
      "host": "localhost",
      "port": 27017,
      "poolSize": 5,
      "auth": {
        "user": "admin",
        "password": "admin"
      }
    }
  }
  ```
- api

  - find: find the records
    ```javascript
    let data = await fpm.execute('mongo.find', { collection: 'foo', condition: { name: 'bar1' }, limit: 5, sort: 'i-', skip: 5 });
    // data is a array of datas
    /* Find: [ ... ]
    //*/
    ```
  - first: get the first record of the matched records
    ```javascript
    let { data } = await fpm.execute('mongo.first', { collection: 'foo', condition: { name: 'bar1' }, limit: 5, sort: 'i-', skip: 5 });
    // data is a object or null
    // First: { data: null }
    ```
  - create: insert a row
    ```javascript
    let data = await fpm.execute('mongo.create', { collection: 'foo', row: { name: 'bar' } });
    // data is a object contains _id
    // Create: { name: 'bar', _id: '5bf2ad16aae34848387dc6c1' }
    ```
  - batch: insert rows
    ```javascript
    let data = await fpm.execute('mongo.batch', { collection: 'foo', rows: [ { name: 'bar1' }, { name: 'bar12' }, { name: 'bar13' } ] });
    // data is a object contains n, ok
    // Batch: { ok: 1, n: 3 }
    ```
  - remove: remove one row
    ```javascript
    let data = await fpm.execute('mongo.remove', { collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' });
    // data is the result, it throws error if not exits
    ```
  - save: save one row
    ```javascript
    let data = await fpm.execute('mongo.save', { collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6', row: { name: 'modified' } });
    // data is the result, it throws error if not exits
    // { n: 1, nModified: 0, ok: 1 }
    ```
  - update: update rows
    ```javascript
    let data = await fpm.execute('mongo.update', { collection: 'foo', condition: { name: 'bar' }, row: { name: 'modified' } });
    // data is the result
    // Update: { n: 11, nModified: 1, ok: 1 }
    ```
  - clean: clean the records
    ```javascript
    let data = await fpm.execute('mongo.clean', { collection: 'foo', condition: { name: 'bar1' } });
    // data is a array of datas
    // Clean: { n: 1, ok: 1 }
    ```
  - count: count the records
    ```javascript
    let data = await fpm.execute('mongo.count', { collection: 'foo', condition: { name: 'bar1' }});
    // data is a array of datas
    // Count: { count: 40 }
    ```
  - find: findAndCount the records
    ```javascript
    let data = await fpm.execute('mongo.findAndCount', { collection: 'foo', condition: { name: 'bar1' }, limit: 5, sort: 'i-', skip: 5 });
    // data is a array of datas
    /* FindAndCount: { count: 40,
        rows: [ ... ]
      }
      //*/
    ```

### Mongodb Manual




### Backup the db
```bash
# run docker exec

docker exec -it mongo_server /bin/bash

# mongodump -h 127.0.0.1 --port 27017 -u [user] -p [pass] -d [dbname] -o /backup/dump --authenticationDatabase admin
# tar -zcvf testDB.tar.gz /backup/dump/testDB
# remove the dir
mongodump -u admin -p admin --authenticationDatabase admin -o /backup/dump  \
&& tar -C /backup/dump -zcvf /backup/all.tar.gz . \
&& rm -rf /backup/dump/*

```
### Store the db

注：

1、mongorestore恢复数据默认是追加，如打算先删除后导入，可以加上--drop参数，不过添加--drop参数后，会将数据库数据清空后再导入，如果数据库备份后又新加入了数据，也会将新加的数据删除，它不像mysql有一个存在的判断。

```bash
# run docker exec

docker exec -it mongo_server /bin/bash

# unzip && restore all dbs
tar -C /backup/store -zxvf /backup/all.tar.gz \
&& mongorestore -u admin -p admin --authenticationDatabase admin --drop /backup/store/  \
&& rm -rf /backup/store/*

```