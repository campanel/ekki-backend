process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
chai.should();

var userTest = {
    name: "The Lord",
    document: "004" + Math.floor((Math.random() * 100000) + 1),
};

var contactTest = {
    name: "Sr Contact",
    document: "005" + Math.floor((Math.random() * 100000) + 1),
};

describe("users", () => {
    describe("GET /api/users", () => {
        
        // trazer todos os usuarios
        it("Todos usuarios", (done) => {
             chai.request(app)
                 .get('/api/users')
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     done();
                  });
         });
        
    });
    describe('POST, GET, UPDATE, DELETE , GET CONTACTS, users', () => {
        let user = {}
        let contact = {}

        //criar usuário
        it('POST user', (done) => {
              chai.request(app)
              .post('/api/users')
              .send(userTest)
              .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User created!');
                    //ID
                    user.id = res.body.data.id;
                done();
              });
        });

        // trazer usuario
        it("GET Usuario", (done) => {
            chai.request(app)
                .get(`/api/users/${user.id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                 });
        });

        //trazer contatos do usuário
        it("GET contatos do usuario", (done) => {
            chai.request(app)
                .get(`/api/users/${user.id}/contacts`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    console.log(res.body);
                    done();
                });
        });

        //update do usuário
        it('UPDATE user name', (done) => {
            chai.request(app)
            .put('/api/users/' + user.id )
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

        //Criar contato
        it('POST contact', (done) => {
            chai.request(app)
            .post(`/api/users/${user.id}/contacts`)
            .send(contactTest)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Contact created!');
              done();
            });
        });

        //Criar contato com mesmo CPF e ja associado deve retornar, ja associado
        it('POST user', (done) => {
            chai.request(app)
            .post(`/api/users/${user.id}/contacts`)
            .send(contactTest)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Contact Attached!');
                  //ID contact
                  contact.contact_id = res.body.data.contact_id;
              done();
            });
        });

        //detach contato
        it('DETACH contact', (done) => {
            chai.request(app)
            .delete(`/api/users/${user.id}/contacts/${contact.contact_id}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Contact deleted!');
            done();
            });
        });
        
        //deletar usuário
        it('DELETE user', (done) => {
            chai.request(app)
            .delete('/api/users/' + user.id )
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('User deleted!');
            done();
            });
        });

        //deletar usuario criado como contato
        it('DELETE user contact', (done) => {
            chai.request(app)
            .delete('/api/users/' + contact.contact_id )
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('User deleted!');
            done();
            });
        });
    });

});