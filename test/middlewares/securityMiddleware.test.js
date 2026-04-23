const { expect } = require('chai');

describe('Security configuration validation', () => {
  it('should fail when JWT_SECRET is missing', () => {
    const {
      validateSecurityConfig
    } = require('../../src/config/SecurityConfig');

    expect(() => validateSecurityConfig({})).to.throw('JWT_SECRET');
  });

  it('should fail when JWT_SECRET uses insecure default-like value', () => {
    const {
      validateSecurityConfig
    } = require('../../src/config/SecurityConfig');

    expect(() =>
      validateSecurityConfig({ JWT_SECRET: 'your_secret_key' })
    ).to.throw('JWT_SECRET');
  });

  it('should pass when JWT_SECRET is present and not default-like', () => {
    const {
      validateSecurityConfig
    } = require('../../src/config/SecurityConfig');

    expect(() =>
      validateSecurityConfig({ JWT_SECRET: 'secure_test_secret_123' })
    ).to.not.throw();
  });
});
