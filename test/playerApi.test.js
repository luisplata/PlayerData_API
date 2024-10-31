const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index'); // Asegúrate de exportar `app` desde `index.js` para poder importarlo aquí

chai.use(chaiHttp);

describe('Player API', () => {
  // Prueba para agregar un jugador
  it('should add a new player', (done) => {
    chai.request(app)
      .post('/api/player')
      .send({ playerId: 1, nickname: 'player1' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('nickname', 'player1');
        done();
      });
  });

  // Prueba para validar si un nickname está disponible
  it('should return true if nickname is available', (done) => {
    chai.request(app)
      .get('/api/player/validate/player3')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.true;
        done();
      });
  });

  // Prueba para validar si un nickname no está disponible
  it('should return false if nickname is taken', (done) => {
    chai.request(app)
      .get('/api/player/validate/player1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.false;
        done();
      });
  });

  // Prueba para obtener un Player ID por nickname
  it('should return player ID when nickname exists', (done) => {
    chai.request(app)
      .get('/api/player/player1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.equal(1);
        done();
      });
  });

  // Prueba para manejar cuando el nickname no existe
  it('should return 404 when nickname does not exist', (done) => {
    chai.request(app)
      .get('/api/player/unknown_player')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('message', 'Player not found');
        done();
      });
  });
});
