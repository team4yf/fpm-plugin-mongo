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
        ref.use({ dbname: 'ddd' })
        // console.log(ref);
        for(let i = 0; i < 10; i++)
          ref.create({ collection: 'foo', row: { name: 'bar1', i, v: Math.random(10) } });

        done()
      }, 1000);
      
    });
    
  })


  after(done => {
    // shutdown the server
    done()
    setTimeout( () =>{
      process.exit();
    }, 1000);
  })

  it('Function find', function(done){
    ref.find({ collection: 'foo', condition: { name: 'bar1' }, limit: 5, sort: 'i-', skip: 5 })
      .then( data => {
        // console.log('Find:', data);
        done();
      })
      .catch( done );
  })

  it('Function first', function(done){
    ref.first({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        console.log('First:', data);
        done();
      })
      .catch( done );
  })

  it('Function Create', function(done){
    ref.create({ collection: 'foo', row: { name: 'bar' } })
      .then( data => {
        console.log('Create:', data);
        done();
      })
      .catch( done );
  })

  it('Function Batch', function(done){
    ref.batch({ collection: 'foo', rows: [ { name: 'bar1' }, { name: 'bar12' }, { name: 'bar13' } ] })
      .then( data => {
        console.log('Batch:', data);
        done();
      })
      .catch( done );
  })

  it('Function remove', function(done){
    ref.remove({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        console.log('Remove:', data);
        done();
      })
      .catch( done );
  })

  it('Function save', function(done){
    ref.save({ collection: 'foo', id: '5bf2a80bcb293945ab11c58d', row: { name: 'modifyed'} })
      .then( data => {
        console.log('Save:', data);
        done();
      })
      .catch( done );
  })

  it('Function update', function(done){
    ref.update({ collection: 'foo', condition: { i: 1 }, row: { name: 'modifyed'} })
      .then( data => {
        console.log('Update:', data);
        done();
      })
      .catch( done );
  })

  it('Function clean', function(done){
    ref.clean({ collection: 'foo', condition: { name: 'bar' } })
      .then( data => {
        console.log('Clean:', data);
        done();
      })
      .catch( done );
  })

  it('Function get', function(done){
    ref.get({ collection: 'foo', id: '5bf26e4efdd5f12e08fab6b6' })
      .then( data => {
        console.log('Get:', data);
        done();
      })
      .catch( done );
  })

  it('Function count', function(done){
    ref.count({ collection: 'foo', condition: { name: 'bar1' } })
      .then( data => {
        console.log('Count:', data);
        done();
      })
      .catch( done );
  })

  it('Function findAndCount', function(done){
    ref.findAndCount({ collection: 'foo', condition: { name: 'bar1' }, limit: 100, sort: 'i-,v+', skip: 0 })
      .then( data => {
        // console.log('FindAndCount:', data);
        done();
      })
      .catch( done );
  })
})
