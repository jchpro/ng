import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { admitVersion, caretSatisfies } from './libs.mjs';

describe('caretSatisfies', () => {

  it('should pin the minor on 0.x and the major from 1.0', () => {
    assert.equal(caretSatisfies('^0.9.0', '0.9.0'), true);
    assert.equal(caretSatisfies('^0.9.0', '0.9.4'), true);
    assert.equal(caretSatisfies('^0.9.0', '0.10.0'), false);
    assert.equal(caretSatisfies('^0.9.2', '0.9.1'), false);
    assert.equal(caretSatisfies('^1.2.0', '1.9.0'), true);
    assert.equal(caretSatisfies('^1.2.0', '2.0.0'), false);
  });

  it('should accept a list of carets, satisfied by any of them', () => {
    assert.equal(caretSatisfies('^0.8.0 || ^0.9.0', '0.8.3'), true);
    assert.equal(caretSatisfies('^0.8.0 || ^0.9.0', '0.9.1'), true);
    assert.equal(caretSatisfies('^0.8.0 || ^0.9.0', '0.10.0'), false);
    assert.equal(caretSatisfies('^0.8.0||^0.9.0', '0.9.0'), true);
  });

  it('should answer null for what is not a list of plain carets', () => {
    assert.equal(caretSatisfies('>=0.8.0', '0.9.0'), null);
    assert.equal(caretSatisfies('~0.9.0', '0.9.0'), null);
    assert.equal(caretSatisfies('^0.9', '0.9.0'), null);
    assert.equal(caretSatisfies('^0.8.0 || >=0.9.0', '0.9.0'), null);
  });

});

describe('admitVersion', () => {

  it('should leave a range that already admits the version as it is, a patch included', () => {
    assert.equal(admitVersion('^0.8.0 || ^0.9.0', '0.9.0'), '^0.8.0 || ^0.9.0');
    assert.equal(admitVersion('^0.8.0 || ^0.9.0', '0.9.1'), '^0.8.0 || ^0.9.0');
  });

  it('should add a clause for a new minor, and keep the lowest version where it is', () => {
    assert.equal(admitVersion('^0.8.0 || ^0.9.0', '0.10.0'), '^0.8.0 || ^0.9.0 || ^0.10.0');
    assert.equal(admitVersion('^0.9.0', '0.10.0'), '^0.9.0 || ^0.10.0');
  });

  it('should not touch a range it does not understand', () => {
    assert.equal(admitVersion('>=0.8.0', '0.10.0'), '>=0.8.0');
  });

});
