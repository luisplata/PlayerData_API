const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index'); // Asegúrate de exportar `app` desde `index.js` para poder importarlo aquí

chai.use(chaiHttp);

describe('Player API', () => {
  let playerId1;

  // Prueba para agregar un jugador
  it('should add a new player', (done) => {
    chai.request(app)
      .post('/api/player')
      .send({ playerId: 'player1_id', nickname: 'player1' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('nickname', 'player1');
        expect(res.body).to.have.property('playerId', 'player1_id');
        expect(res.body).to.have.property('id');
        playerId1 = res.body.id; // Guardar el id generado para otras pruebas
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
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('playerId', 'player1_id');
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

  // Prueba para obtener un jugador por ID
  it('should return player details when player ID exists', (done) => {
    chai.request(app)
      .get(`/api/player/id/${playerId1}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id', playerId1);
        expect(res.body).to.have.property('nickname', 'player1');
        expect(res.body).to.have.property('playerId', 'player1_id');
        done();
      });
  });

  // Prueba para manejar cuando el ID del jugador no existe
  it('should return 404 when player ID does not exist', (done) => {
    chai.request(app)
      .get('/api/player/id/99999')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('message', 'Player not found');
        done();
      });
  });
  // Prueba para actualizar el nickname de un jugador por playerId
it('should update the nickname of a player', (done) => {
  // Simula la respuesta de la base de datos para la actualización
  dbStub.yields(1); // 1 fila actualizada

  chai.request(app)
    .put('/api/player/nickname/player1_id')
    .send({ nickname: 'new_nickname' })
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('message', 'Nickname updated successfully');
      done();
    });
});

// Prueba para el caso en que el jugador no se encuentra
it('should return 404 if player is not found', (done) => {
  // Simula la respuesta de la base de datos para la actualización
  dbStub.yields(0); // 0 filas actualizadas

  chai.request(app)
    .put('/api/player/nickname/nonexistent_player_id')
    .send({ nickname: 'new_nickname' })
    .end((err, res) => {
      expect(res).to.have.status(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('message', 'Player not found');
      done();
    });
});
});
