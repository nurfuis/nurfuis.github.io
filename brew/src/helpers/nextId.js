// unique id
let nextId = 0;

export function generateUniqueId() {
  return ++nextId;
}