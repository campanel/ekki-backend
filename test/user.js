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

        //trazer tranferencias do usuário
        it("GET transferencias do usuario", (done) => {
            chai.request(app)
                .get(`/api/users/${user.id}/transfers`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        //tranferencia acima do valor
        it('POST transferencia acima do valor', (done) => {
            chai.request(app)
            .post(`/api/users/${user.id}/transfers`)
            .send({contact_id : contact.contact_id, value: 2000})
            .end((err, res) => {
                  res.should.have.status(500);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Saldo insuficiente!');
              done();
            });
        });

        //tranferencia dentro do valor
        it('POST transferencia dentro do valor(750)', (done) => {
            chai.request(app)
            .post(`/api/users/${user.id}/transfers`)
            .send({contact_id : contact.contact_id, value: 750})
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Transferência realizada com sucesso!');
              done();
            });
        });

        //tranferencia de mesmo valor em menos de 2 minutos do valor
        it('POST tranferencia de mesmo valor em menos de 2 minutos do valor', (done) => {
            chai.request(app)
            .post(`/api/users/${user.id}/transfers`)
            .send({contact_id : contact.contact_id, value: 750})
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Transferência atualizada!');
              done();
            });
        });

        //tranferencia utilizacao do limite
        it('POST tranferencia utilizacao do limite (600)', (done) => {
            chai.request(app)
            .post(`/api/users/${user.id}/transfers`)
            .send({contact_id : contact.contact_id, value: 600})
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('O limite foi utilizado nesta transferência!');
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