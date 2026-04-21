/**
 * lib/infrastructure/auth/index.js
 * Barrel — capa auth
 */
export { findUserByEmail, createUser, listUsers } from "./user-repository";
export {
  createRegisteredPerson,
  findPersonByEmail,
  listRegisteredPersons,
} from "./person-repository";
