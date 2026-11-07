import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';

const release = (...args) => spawnSync(process.execPath, ['scripts/release.mjs', ...args], { encoding: 'utf8', input: '' });

describe('release ship without a terminal', () => {

  it('should stop before touching git or GitHub when --yes is not passed', () => {
    const result = release('ship', 'kit', '9.9.9');

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not a terminal: pass --yes/);
    assert.doesNotMatch(result.stdout, /branch|PR|Waiting/i);
  });

});
