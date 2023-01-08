export const template = (...names: string[]): string => {
    return `
import { System } from 'eaciest';

${names.map(name => `
export class ${name} extends System {

 constructor () {
   super({
     default: [],
   });
 }

 update() {
   
 }

}
  `).join('\n')
        }
  `
};

export const SRC = `
import { System } from 'eaciest';

// ignored or something

export class Foo extends System {

 constructor () {
   super({
     default: [],
   });
 }

 update() {
   
 }

}


// @ignored
export class Ignored extends System {

 constructor () {
   super({
     default: [],
   });
 }

 update() {
   
 }

}

export class Ololo {

 constructor () {
   super({
     default: [],
   });
 }

 update() {
   
 }

}

export class TopKek extends System {

 constructor () {
   super({
     default: [],
   });
 }

 update() {
   
 }

}
`;

