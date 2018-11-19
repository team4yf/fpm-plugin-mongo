'use strict';
const { Fpm } = require('yf-fpm-server');
const plugin = require('../src');
require("chai").should();
const app = new Fpm();
let ref = plugin.bind(app);;


describe('Function', function(){
  before(done => {
    // run the plugin run 
    let biz = app.createBiz('0.0.1');

    biz.addSubModules('test',{
      foo: args => {
        return Promise.reject({errno: -3001})
      }
    })
    app.addBizModules(biz);
    app.runAction('INIT', app)
    
    app.run().then(() => {
      
      // ref.use({ dbname: 'testDB' });
      setTimeout( () => {
        // console.log(ref);
        done()
      }, 1000);
      
    });
    
  })


  after(done => {
    // shutdown the server
    done()
  })

  it('Function find', function(done){
    ref.find({ collection: 'foo', condition: { name: 'bar' }, limit: 10, sort: 'id-', skip: 5 })
      .then( data => {
        done();
      })
      .catch( done );
  })

  it('Function first', function(done){
    ref.first({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        console.log(data)
        done();
      })
      .catch( done );
  })

  it('Function Create', function(done){
    ref.create({ collection: 'foo', row: { name: 'bar' } })
      .then( data => {
        console.log(data)
        done();
      })
      .catch( done );
  })

  it('Function remove', function(done){
    ref.remove({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        done();
      })
      .catch( done );
  })

  it('Function clean', function(done){
    ref.clean({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        done();
      })
      .catch( done );
  })

  it('Function get', function(done){
    ref.get({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        console.log(data)
        done();
      })
      .catch( done );
  })

  it('Function count', function(done){
    ref.count({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        console.log(data)
        done();
      })
      .catch( done );
  })

  it('Function findAndCount', function(done){
    ref.findAndCount({ collection: 'foo', condition: { name: 'bar' }, limit: 10, sort: 'id-', skip: 5 })
      .then( data => {
        done();
      })
      .catch( done );
  })

})
