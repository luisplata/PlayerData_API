const { expect } = require('chai');
const Hero = require('../../src/entities/Hero');
const Passive = require('../../src/entities/Passive');
const Dialog = require('../../src/entities/Dialog');

describe('Heroes domain entities', () => {
  describe('Hero', () => {
    it('validates a hero with metadata', () => {
      const hero = new Hero('hero-001', 'Astra', { element: 'light' });

      expect(() => hero.validate()).to.not.throw();
      expect(hero.heroId).to.equal('hero-001');
      expect(hero.name).to.equal('Astra');
      expect(hero.metadata).to.deep.equal({ element: 'light' });
    });

    it('rejects invalid hero metadata', () => {
      const hero = new Hero('', '', null);

      expect(() => hero.validate()).to.throw('Hero ID is required and must be a string');
    });
  });

  describe('Passive', () => {
    it('validates a passive with metadata', () => {
      const passive = new Passive('passive-001', 'Solar Shield', 'hero-001', { type: 'defense' });

      expect(() => passive.validate()).to.not.throw();
      expect(passive.passiveId).to.equal('passive-001');
      expect(passive.name).to.equal('Solar Shield');
      expect(passive.heroId).to.equal('hero-001');
      expect(passive.metadata).to.deep.equal({ type: 'defense' });
    });
  });

  describe('Dialog', () => {
    it('validates a dialog with metadata', () => {
      const dialog = new Dialog('dialog-001', 'hero-001', 'Intro', { stage: 1 });

      expect(() => dialog.validate()).to.not.throw();
      expect(dialog.dialogId).to.equal('dialog-001');
      expect(dialog.heroId).to.equal('hero-001');
      expect(dialog.title).to.equal('Intro');
      expect(dialog.metadata).to.deep.equal({ stage: 1 });
    });
  });
});
