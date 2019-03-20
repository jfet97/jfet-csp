import * as test from 'tape';
import { Channel } from '../src';
import '../src/operators/map';
import '../src/operators/filter';
import '../src/operators/delay';

type Input = string | number;

const msg = (() => {
  let i = 0;
  return () => ++i;
})();

test('[csp] channel', t => {
  const chan = new Channel<number>();
  t.equal(Object.getOwnPropertySymbols(chan.getInnerChannel()).length, 4, 'should contain 4 symbol properties');
  t.equal(Object.getOwnPropertySymbols(Object.getPrototypeOf(chan)).length, 1, 'should contain 1 symbol properties');
  t.end();
});

test('[csp] put', t => {
  const chan = new Channel<string>();
  const res = chan.put('foo');
  t.ok(res instanceof Promise, 'should return an instance of a Promise');
  t.end();
});

test('[csp] take', t => {
  const chan = new Channel();
  const res = chan.take();
  t.ok(res instanceof Promise, 'should return an instance of a Promise');
  t.end();
});

test('[csp] alts', t => {
  const chan1 = new Channel();
  const chan2 = new Channel();
  const res = Channel.alts(chan1, chan2);
  t.ok(res instanceof Promise, 'should return an instance of a Promise');
  t.end();
});

test('[csp] drain', async t => {
  const chan = new Channel<number>();
  const messages = [msg(), msg(), msg(), msg(), msg()];
  messages.forEach(m => chan.put(m));
  const res = chan.drain();
  t.ok(res instanceof Promise, 'should return an instance of a Promise');
  const result = await res;
  t.deepEqual(result, messages, 'should drain the channel');
  t.end();
});

test('[csp] take, already put', async t => {
  const chan = new Channel<number>();
  const m = msg();
  chan.put(m);
  const res = await chan.take();
  t.equal(res, m, 'should resolve the correct value');
  t.end();
});

test('[csp] put, already taking', async t => {
  const chan = new Channel<number>();
  const m = msg();
  const result = chan.take();
  await chan.put(m);
  const res = await result;
  t.equal(res, m, 'should resolve the correct value');
  t.end();
});

test('[csp] take with asynciterable interface', async t => {
  const chan = new Channel<number>();
  const m = msg();
  chan.put(m);
  const res = (await chan[Symbol.asyncIterator]().next()).value;
  t.equal(res, m, 'should resolve the correct value');
  t.end();
});

test('[csp] alts, chan1 ready', async t => {
  const chan1 = new Channel<number>();
  const chan2 = new Channel<string>();
  const m = msg();
  const result = Channel.alts<Input>(chan1, chan2);
  await chan1.put(m);
  const res = await result;
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] alts, chan2 ready', async t => {
  const chan1 = new Channel();
  const chan2 = new Channel();
  const m = msg();
  const putter = chan2.put(m);
  const result = Channel.alts(chan1, chan2);
  await putter;
  const res = await result;
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Array, chan1 ready', async t => {
  const chan1 = new Channel<number>();
  const chan2 = new Channel<string>();
  const m = msg();
  const result = Channel.select<Input>([chan1, chan2]);
  await chan1.put(m);
  const [id, res] = await result;
  t.equal(id, 0, 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Array, chan2 ready', async t => {
  const chan1 = new Channel();
  const chan2 = new Channel();
  const m = msg();
  const putter = chan2.put(m);
  const result = Channel.select([chan1, chan2]);
  await putter;
  const [id, res] = await result;
  t.equal(id, 1, 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Map, chan1 ready', async t => {
  const chan1 = new Channel<number>();
  const chan2 = new Channel<string>();
  const m = msg();
  const key1 = Symbol();
  const key2 = Symbol();
  const result = Channel.select<Input>(new Map<Symbol, Channel<Input>>([[key1, chan1], [key2, chan2]]));
  await chan1.put(m);
  const [id, res] = await result;
  t.equal(id, key1, 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Map, chan2 ready', async t => {
  const chan1 = new Channel();
  const chan2 = new Channel();
  const m = msg();
  const putter = chan2.put(m);
  const key1 = Symbol();
  const key2 = Symbol();
  const result = Channel.select(new Map([[key1, chan1], [key2, chan2]]));
  await putter;
  const [id, res] = await result;
  t.equal(id, key2, 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Object, chan1 ready', async t => {
  const chan1 = new Channel<number>();
  const chan2 = new Channel<string>();
  const m = msg();
  const result = Channel.select<Input>({ a: chan1, b: chan2 });
  await chan1.put(m);
  const [id, res] = await result;
  t.equal(id, 'a', 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Object, chan2 ready', async t => {
  const chan1 = new Channel();
  const chan2 = new Channel();
  const m = msg();
  const putter = chan2.put(m);
  const result = Channel.select({ a: chan1, b: chan2 });
  await putter;
  const [id, res] = await result;
  t.equal(id, 'b', 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Set, chan1 ready', async t => {
  const chan1 = new Channel<number>();
  const chan2 = new Channel<string>();
  const m = msg();
  const result = Channel.select<Input>(new Set([chan1, chan2]));
  await chan1.put(m);
  const [id, res] = await result;
  t.equal(id, chan1, 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] select Set, chan2 ready', async t => {
  const chan1 = new Channel();
  const chan2 = new Channel();
  const m = msg();
  const putter = chan2.put(m);
  const result = Channel.select(new Set([chan1, chan2]));
  await putter;
  const [id, res] = await result;
  t.equal(id, chan2, 'should receive the correct id');
  t.equal(res, m, 'should receive the correct value');
  t.end();
});

test('[csp] operator map', async t => {
  const chan = new Channel<number>();
  const m = msg();
  chan.put(m);
  const res = await chan.map(v => 10*v).take();
  t.equal(res, m*10, 'should resolve the correct value');
  t.end();
});

test('[csp] operator filter', async t => {
  const chan = new Channel<number>();
  chan.put(1);
  chan.put(2);
  chan.put(3);
  chan.put(4);
  const resCh = chan.filter(v => Boolean(v % 2));
  const v1 = await resCh.take();
  const v2 = await resCh.take();
  t.equal(v1, 1, 'should resolve the correct value');
  t.equal(v2, 3, 'should resolve the correct value');
  t.end();
});

test('[csp] operator delay', async t => {
  const chan = new Channel<number>();
  chan.put(1);
  const now = process.hrtime()[0];
  await chan.delay(3000).take();
  const later = process.hrtime()[0];
  const timeDifferenceInSeconds = later - now;
  t.equal(timeDifferenceInSeconds >= 3, true, 'should resolve the correct value');
  t.end();
});

