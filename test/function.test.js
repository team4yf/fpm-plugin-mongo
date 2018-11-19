require("chai").should();
const fpmc = require("yf-fpm-client-js").default;
const { Func } = fpmc;
fpmc.init({appkey: '123123', masterKey: '123123', domain: 'http://localhost:9999'});


describe('Function', function(){
  beforeEach(done => {
    done()
  })


  afterEach(done => {
    done()
  })


  it('Function find', function(done){
    new Func('mongo.find')
      .invoke({ collection: 'foo', condition: { name: 'bar1' }, limit: 5, sort: 'i-', skip: 5 })
      .then( data => {
        console.log('Find:', data);
        done();
      })
      .catch( done );
  })

  it('Function first', function(done){
    new Func('mongo.first')
      .invoke({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        console.log('First:', data);
        done();
      })
      .catch( done );
  })

  it('Function Create', function(done){
    new Func('mongo.create')
      .invoke({ collection: 'foo', row: { name: 'bar' } })
      .then( data => {
        console.log('Create:', data);
        done();
      })
      .catch( done );
  })

  it('Function remove', function(done){
    new Func('mongo.remove')
      .invoke({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        console.log('Remove:', data);
        done();
      })
      .catch( done );
  })

  it('Function clean', function(done){
    new Func('mongo.clean')
      .invoke({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        console.log('Clean:', data);
        done();
      })
      .catch( done );
  })

  it('Function get', function(done){
    new Func('mongo.get')
      .invoke({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        console.log('Get:', data);
        done();
      })
      .catch( done );
  })

  it('Function count', function(done){
    new Func('mongo.count')
      .invoke({ collection: 'foo', condition: { name: 'bar1' } })
      .then( data => {
        console.log('Count:', data);
        done();
      })
      .catch( done );
  })

  it('Function findAndCount', function(done){
    new Func('mongo.findAndCount')
      .invoke({ collection: 'foo', condition: { name: 'bar1' }, limit: 100, sort: 'i-,v+', skip: 0 })
      .then( data => {
        console.log('FindAndCount:', data);
        done();
      })
      .catch( done );
  })
})
