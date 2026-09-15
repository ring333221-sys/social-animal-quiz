import assert from "node:assert/strict";
import test from "node:test";

const animals = ["lion", "dolphin", "dog", "owl", "fox", "cat", "elephant", "squirrel"];

class Room {
  status = "OPEN";
  results = new Map();
  listeners = new Set();
  submit(participantId, primaryAnimal, secondaryAnimal = "owl") {
    if (this.status !== "OPEN") throw new Error("CLOSED");
    this.results.set(participantId, { primaryAnimal, secondaryAnimal });
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }
  close() { this.status = "CLOSED"; }
  snapshot() {
    const counts = Object.fromEntries(animals.map((animal) => [animal, 0]));
    for (const result of this.results.values()) counts[result.primaryAnimal] += 1;
    return { total: this.results.size, counts };
  }
}

test("10 participants aggregate correctly and percentages sum to 100", () => {
  const room = new Room();
  ["lion", "dolphin", "dolphin", "dog", "dog", "owl", "owl", "fox", "cat", "elephant"]
    .forEach((animal, index) => room.submit(`device-${index}`, animal));
  const { total, counts } = room.snapshot();
  assert.equal(total, 10);
  assert.deepEqual(counts, { lion: 1, dolphin: 2, dog: 2, owl: 2, fox: 1, cat: 1, elephant: 1, squirrel: 0 });
  assert.equal(Object.values(counts).reduce((sum, count) => sum + count / total * 100, 0), 100);
});

test("same participant refresh does not duplicate and a retake updates", () => {
  const room = new Room();
  room.submit("same-device", "owl", "cat");
  room.submit("same-device", "owl", "cat");
  assert.equal(room.snapshot().total, 1);
  room.submit("same-device", "dolphin", "lion");
  assert.deepEqual(room.snapshot().counts, { lion: 0, dolphin: 1, dog: 0, owl: 0, fox: 0, cat: 0, elephant: 0, squirrel: 0 });
});

test("wall receives automatic updates and closed room rejects submissions", () => {
  const room = new Room();
  let observed = null;
  room.listeners.add((snapshot) => { observed = snapshot; });
  room.submit("device-1", "squirrel");
  assert.equal(observed.counts.squirrel, 1);
  room.close();
  assert.throws(() => room.submit("device-2", "cat"), /CLOSED/);
  assert.equal(room.snapshot().total, 1);
});
