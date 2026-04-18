const { expect } = require('chai');
const Hero = require('../../src/entities/Hero');
const Passive = require('../../src/entities/Passive');
const Dialog = require('../../src/entities/Dialog');

describe('Heroes entities validation coverage', () => {
  it('covers Hero validation error branches', () => {
    expect(() => Hero.validateHeroId('ab')).to.throw('Hero ID must be between 3 and 50 characters');
    expect(() => Hero.validateHeroId('hero id')).to.throw('Hero ID can only contain letters, numbers, underscores, and hyphens');
    expect(() => Hero.validateName('')).to.throw('Hero name is required and must be a string');
    expect(() => Hero.validateName('a')).to.throw('Hero name must be between 2 and 80 characters');
    expect(() => Hero.validateMetadata(null)).to.throw('Hero metadata must be an object');
  });

  it('covers Passive validation error branches', () => {
    expect(() => Passive.validatePassiveId('ab')).to.throw('Passive ID must be between 3 and 50 characters');
    expect(() => Passive.validatePassiveId('passive id')).to.throw('Passive ID can only contain letters, numbers, underscores, and hyphens');
    expect(() => Passive.validateName('')).to.throw('Passive name is required and must be a string');
    expect(() => Passive.validateName('a')).to.throw('Passive name must be between 2 and 80 characters');
    expect(() => Passive.validateHeroId(null)).to.throw('Hero ID is required and must be a string');
    expect(() => Passive.validateMetadata([])).to.throw('Passive metadata must be an object');
  });

  it('covers Dialog validation error branches', () => {
    expect(() => Dialog.validateDialogId('ab')).to.throw('Dialog ID must be between 3 and 50 characters');
    expect(() => Dialog.validateHeroId(null)).to.throw('Hero ID is required and must be a string');
    expect(() => Dialog.validateTitle('')).to.throw('Dialog title is required and must be a string');
    expect(() => Dialog.validateTitle('a')).to.throw('Dialog title must be between 2 and 120 characters');
    expect(() => Dialog.validateMetadata(null)).to.throw('Dialog metadata must be an object');
  });
});
