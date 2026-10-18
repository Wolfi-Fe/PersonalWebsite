import assert from 'node:assert/strict';
import { detectHardwareAcceleration, automaticMotionState, nextMotionPreference, resolvedMotionState } from '../motion.js';

const results = [];
function graphicsFixture(renderer, options = {}) {
  const calls = [];
  let released = false;
  const context = {
    isContextLost: () => Boolean(options.lost),
    getContextAttributes: () => ({failIfMajorPerformanceCaveat: options.caveatAccepted !== false}),
    getExtension: name => name === 'WEBGL_lose_context'
      ? {loseContext: () => { released = true; }}
      : options.masked ? null : {UNMASKED_RENDERER_WEBGL: 0x9246},
    getParameter: () => renderer,
  };
  const createCanvas = () => ({getContext: (type,attributes) => {
    calls.push({type,attributes});
    return options.unavailable || (options.webgl1Only && type === 'webgl2') ? null : context;
  }});
  return {createCanvas,calls,wasReleased: () => released};
}
const cases = [
  ['Hardware / NVIDIA', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Ti Direct3D11)', {}, true],
  ['Hardware / integrated Intel', 'ANGLE (Intel, Intel Iris Xe Graphics Direct3D11)', {}, true],
  ['Hardware / Apple', 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2)', {}, true],
  ['Hardware / Android', 'Adreno (TM) 740', {}, true],
  ['WebGL 1 fallback', 'AMD Radeon RX 6800', {webgl1Only:true}, true],
  ['SwiftShader software', 'ANGLE (Google, Vulkan (SwiftShader Device (Subzero)))', {}, false],
  ['llvmpipe software', 'llvmpipe (LLVM 17.0, 256 bits)', {}, false],
  ['WARP despite vendor text', 'ANGLE (Microsoft WARP, Intel fallback)', {}, false],
  ['Graphics unavailable', '', {unavailable:true}, false],
  ['Privacy-masked renderer', 'WebKit WebGL', {masked:true}, false],
  ['Unknown renderer', 'Generic Graphics Device', {}, false],
  ['Lost graphics context', 'NVIDIA GeForce RTX 3080 Ti', {lost:true}, false],
  ['Performance safeguard not accepted', 'NVIDIA GeForce RTX 3080 Ti', {caveatAccepted:false}, false],
];
for (const [name,renderer,options,expected] of cases) {
  const fixture = graphicsFixture(renderer, options);
  assert.equal(detectHardwareAcceleration(fixture.createCanvas), expected, name);
  assert.ok(fixture.calls.every(call => call.attributes.failIfMajorPerformanceCaveat === true));
  assert.ok(fixture.calls.every(call => call.attributes.powerPreference === 'low-power'));
  if (!options.unavailable) assert.equal(fixture.wasReleased(), true, `${name}: probe context released`);
  results.push({name,passed:true});
}
assert.equal(detectHardwareAcceleration(() => {throw new Error('blocked')}), false);
results.push({name:'Browser error keeps effects off',passed:true});
for (const [name,values,expected] of [
  ['Visible hardware page', {reducedMotion:false,hardwareAccelerated:true}, 'active'],
  ['Software page', {reducedMotion:false,hardwareAccelerated:false}, 'paused'],
  ['Unknown graphics result', {reducedMotion:false}, 'paused'],
  ['Reduced movement takes precedence', {reducedMotion:true,hardwareAccelerated:true}, 'paused'],
  ['Hidden tab pauses', {reducedMotion:false,hardwareAccelerated:true,pageVisible:false}, 'paused'],
]) {
  assert.equal(automaticMotionState(values),expected,name);
  results.push({name,passed:true});
}
for (const [name,values,expected] of [
  ['Manual on overrides reduced movement', {manualPreference:'on',reducedMotion:true,hardwareAccelerated:false}, 'active'],
  ['Manual off overrides hardware', {manualPreference:'off',reducedMotion:false,hardwareAccelerated:true}, 'paused'],
  ['Automatic mode keeps system preference', {manualPreference:'auto',reducedMotion:true,hardwareAccelerated:true}, 'paused'],
  ['Hidden page always pauses manual motion', {manualPreference:'on',reducedMotion:false,hardwareAccelerated:true,pageVisible:false}, 'paused'],
]) {
  assert.equal(resolvedMotionState(values),expected,name);
  results.push({name,passed:true});
}
for (const [name,values,expected] of [
  ['Paused automatic state switches on', {currentPreference:'auto',currentState:'paused'}, 'on'],
  ['Active automatic state switches off', {currentPreference:'auto',currentState:'active'}, 'off'],
  ['Manual on returns to automatic', {currentPreference:'on',currentState:'active'}, 'auto'],
  ['Manual off returns to automatic', {currentPreference:'off',currentState:'paused'}, 'auto'],
]) {
  assert.equal(nextMotionPreference(values),expected,name);
  results.push({name,passed:true});
}
console.log(`${results.length} motion-policy checks passed.`);

