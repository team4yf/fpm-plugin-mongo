const _ = require('lodash');
const { MGObject, init, Func } = require("fpmc-jssdk");
const assert = require('assert');
init({ appkey:'123123', masterKey:'123123', endpoint: 'http://localhost:9999/api' });

// const ran = _.random(20, 100);
// console.log('Mock data rows => ', ran)
describe('Function', function(){
  // before(done => {
    
  //   const rows = _.map(Array(ran), (row, i) => {
  //     return {
  //       name: `Name:${_.random(0, ran)}`,
  //       i,
  //     }
  //   })
  //   new Func('mongo.batch')
  //     .invoke({ collection: 'foo', rows })
  //     .then( data => {
  //       assert.strictEqual(data.ok, 1, '')
  //       assert.strictEqual(data.n, ran, '')
  //       done();
  //     })
  //     .catch( done );
  // })


  // after(done => {
  //   new Func('mongo.clean')
  //     .invoke({ collection: 'foo' })
  //     .then( data => {
  //       assert.strictEqual(data.ok, 1, '')
  //       done();
  //     })
  //     .catch(done);
  // })


  it('Function create', function(done){
    new MGObject('foo_db', 'aaa')
      .set({k: 1})
      .create()
      .then( data => {
        // assert.strictEqual(data[0].i, ran - 1, `The first row data.i should be ${ ran - 1}` )
        console.log(data);
        done();
      })
      .catch( done );
  })

})
