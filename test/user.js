process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
chai.should();

var userTest = { id : 1};

describe("users", () => {
    describe("GET /users", () => {
        // Test to get all users record
        it("should get all users record", (done) => {
             chai.request(app)
                 .get('/users')
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     done();
                  });
         });
        // Test to get single user record
        it("should get a single users record", (done) => {
             const id = 1;
             chai.request(app)
                 .get(`/users/${id}`)
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     done();
                  });
         });  
        
    });
    describe('POST, UPDATE, DELETE users', () => {
        let user = {
            name: "The Lord",
            document: "00438178099",
        }
        it('it should not POST a user', (done) => {
              chai.request(app)
              .post('/users')
              .send(user)
              .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User created!');
                    //ID
                    user.id = res.body.data.id;
                done();
              });
        });

        it('it should UPDATE a user given the id', (done) => {
            chai.request(app)
            .put('/users/' + user.id )
            .send({
                    name: "The Lord of Update",
                }
            )
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('User updated!');
            done();
            });
            
        });
        
        it('it should DELETE a user given the id', (done) => {
            chai.request(app)
            .delete('/users/' + user.id )
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('User deleted!');
            done();
            });
        });
    });

});