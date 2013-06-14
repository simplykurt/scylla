var request = require('supertest');
var express = require('express');
var MemoryStore = require('connect').session.MemoryStore;
var sinon = require('sinon');
var Q = require('q');

var app = express();
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: "Scylla", store: new MemoryStore()}));
});

var models = {
    Account:function(){return{};}
};
var controllers = {
    abCompares:require('../../../api/controllers/abComparesController')(app, models)
}
var routes = {
    abcompares:require("../../../api/routes/abComparesRoutes")(app, models, controllers)
}


var getResolvedPromise = function(value){
    var d = Q.defer();
    d.resolve(value);
    return d.promise;
}

describe('GET /abcompares/001', function(){
    var mock;

    afterEach(function(){
        controllers.abCompares.findById.restore();
    });

    it('respond with compare', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("findById").once().withArgs("001", undefined, undefined)
            .returns(getResolvedPromise({"_id":"001"}));

        request(app)
            .get('/abcompares/001')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect({"_id":"001"})
            .end(function(err){
                if(err) throw err;
                mock.verify();
                done();
            })
    });
    it('respond with 404', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("findById").once().withArgs("002")
            .returns(getResolvedPromise());

        request(app)
            .get('/abcompares/002')
            .set('Accept', 'application/json')
            .expect(404)
            .end(function(err){
                if(err) throw err;
                mock.verify();
                done();
            })
    });

});


describe('POST /abcompares/', function(){
    var mock;
    afterEach(function(){
        controllers.abCompares.createNew.restore();
    });

    it('respond with new AbCompare', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("createNew").once().withArgs({name:"Name",urlA:"urlA",urlB:"urlB"})
            .returns(getResolvedPromise({_id:"001", name:"Name", urlA:"urlA", urlB:"urlB"}));

        request(app)
            .post('/abcompares/')
            .send({name:"Name", urlA:"urlA", urlB:"urlB"})
            .expect({_id:"001", name:"Name", urlA:"urlA", urlB:"urlB"})
            .end(function(err){
                if(err) throw err;
                mock.verify();
                done();
            });
    });

    it('fails when missing input', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("createNew").never();
        request(app)
            .post('/abcompares/')
            .send({name:"Name", urlA:"urlA"})
            .expect(400, function(err){
                if(err) throw err;
                mock.verify();
                done();
            });
    });

});

describe('PUT /abcompares/001', function(){
    var mock;
    afterEach(function(){
        controllers.abCompares.update.restore();
    });

    it('respond with updated AbCompare', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("update").once()
                .withArgs("001", {_id:"001", name:"Name",urlA:"urlA",urlB:"urlB"})
            .returns(getResolvedPromise({_id:"001", name:"Name", urlA:"urlA", urlB:"urlB"}));

        request(app)
            .put('/abcompares/001')
            .send({_id:"001", name:"Name", urlA:"urlA", urlB:"urlB"})
            .expect({_id:"001", name:"Name", urlA:"urlA", urlB:"urlB"})
            .end(function(err){
                if(err) throw err;
                mock.verify();
                done();
            });
    });

    it('fails when missing input', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("update").never();
        request(app)
            .put('/abcompares/001')
            .send({_id:"001", name:"Name", urlA:"urlA"})
            .expect(400, function(err){
                if(err) throw err;
                mock.verify();
                done();
            });
    });

});

describe('DEL /abcompares/001', function(){
    var mock;
    afterEach(function(){
        controllers.abCompares.remove.restore();
    });

    it('Deletes AbCompare and returns id of item deleted', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("remove").once()
            .withArgs("001")
            .returns(getResolvedPromise({records:1}));

        request(app)
            .del('/abcompares/001')
            .send()
            .expect({_id:"001"})
            .end(function(err){
                if(err) throw err;
                mock.verify();
                done();
            });
    });

    it('fails when called on invalid id', function(done){
        mock = sinon.mock(controllers.abCompares)
            .expects("remove").once()
            .withArgs("002")
            .returns(getResolvedPromise({records:0}));

        request(app)
            .del('/abcompares/002')
            .send()
            .expect(500, function(err){
                if(err) throw err;
                mock.verify();
                done();
            });
    });

});
