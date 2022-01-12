import * as CANNON from 'cannon-es';

export type CollisionEvent = {body: CANNON.Body, target: CANNON.Body, contact: CANNON.ContactEquation};

let world: CANNON.World = new CANNON.World();

export function getWorld() {
  return world;
}

export function setWorld(newWorld: CANNON.World) {
  world = newWorld;
}
