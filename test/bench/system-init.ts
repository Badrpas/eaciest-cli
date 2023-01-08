import { TopSystem } from './systems/top';
import { KekSystem } from './systems/kek';

import { Engine } from 'eaciest';
export const initSystems = (world: Engine) => {
  world.addSystemClass(KekSystem);
  world.addSystemClass(TopSystem);
};
