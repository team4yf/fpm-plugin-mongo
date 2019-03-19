const _ = require('lodash');
const { init, Func } = require("fpmc-jssdk");
const assert = require('assert');
init({ appkey:'123123', masterKey:'123123', endpoint: 'http://localhost:9999/api' });

const ran = _.random(20, 100);
console.log('Mock data rows => ', ran)
describe('Function', function(){
  before(done => {
    
    const rows = _.map(Array(ran), (row, i) => {
      return {
        name: `Name:${_.random(0, ran)}`,
        i,
      }
    })
    new Func('mongo.batch')
      .invoke({ collection: 'foo', rows })
      .then( data => {
        assert.strictEqual(data.ok, 1, '')
        assert.strictEqual(data.n, ran, '')
        done();
      })
      .catch( done );
  })


  after(done => {
    new Func('mongo.clean')
      .invoke({ collection: 'foo' })
      .then( data => {
        assert.strictEqual(data.ok, 1, '')
        done();
      })
      .catch(done);
  })


  it('Function find', function(done){
    new Func('mongo.find')
      .invoke({ collection: 'foo', limit: 5, sort: 'i-', skip: 0, fields: 'name,i' })
      .then( data => {
        assert.strictEqual(data[0].i, ran - 1, `The first row data.i should be ${ ran - 1}` )
        done();
      })
      .catch( done );
  })

  it('Function first', function(done){
    new Func('mongo.first')
      .invoke({ collection: 'foo', condition: { i: 1 } })
      .then( data => {
        assert.strictEqual(data.i, 1, `This first row data.i should be 1`)
        done();
      })
      .catch( done );
  })

  it('Function Create', function(done){
    new Func('mongo.create')
      .invoke({ collection: 'foo', row: { name: 'bar' } })
      .then( data => {
        assert.strictEqual(data.name, 'bar', `This data.name should be bar`)
        done();
      })
      .catch( done );
  })

  it('Function remove', function(done){
    new Func('mongo.remove')
      .invoke({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        assert.strictEqual(data.ok, 1, '')
        assert.strictEqual(data.n, 1, '')
        done();
      })
      .catch( error => {
        assert.strictEqual(error.errno, -2, error)
        done();
      } );
  })

  it('Function clean', function(done){
    new Func('mongo.clean')
      .invoke({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        assert.strictEqual(data.ok, 1, '')
        assert.strictEqual(data.n, 1, '')
        done();
      })
      .catch( done );
  })

  it('Function get', function(done){
    new Func('mongo.get')
      .invoke({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        done();
      })
      .catch( error => {
        assert.strictEqual(error.errno, -2, error)
        done();
      } );
  })

  it('Function count', function(done){
    new Func('mongo.count')
      .invoke({ collection: 'foo', condition: { i: {$lte: 20} } })
      .then( data => {
        assert.strictEqual(data, 21, 'the count should be 21')
        done();
      })
      .catch( error => {
        assert.strictEqual(error.errno, -2, error)
        done();
      } );
  })

  it('Function findAndCount', function(done){
    new Func('mongo.findAndCount')
      .invoke({ collection: 'foo', condition: { i: {$lte: 20} }, limit: 1, sort: 'i-', skip: 0 })
      .then( data => {
        assert.strictEqual(data.count, 21, 'the count should be 21')
        assert.strictEqual(data.rows[0].i, 20, 'this first row should be 20')
        done();
      })
      .catch( done );
  })
})
