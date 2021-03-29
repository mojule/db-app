import {
  DbLoad, DbLoadMany, DbCreate, DbCreateMany, DbSave, DbSaveMany, DbRemove,
  DbRemoveMany
} from './types'

export const defaultCreateMany = <Entity>( create: DbCreate<Entity> ) => {
  const createMany: DbCreateMany<Entity> = async entities =>
    Promise.all( entities.map( create ) )

  return createMany
}

export const defaultLoadMany = <Entity>( load: DbLoad<Entity> ) => {
  const loadMany: DbLoadMany<Entity> = async ids =>
    Promise.all( ids.map( load ) )

  return loadMany
}

export const defaultSaveMany = <Entity>( save: DbSave<Entity> ) => {
  const saveMany: DbSaveMany<Entity> = async entities =>
    Promise.all( entities.map( save ) ).then( () => {} )

  return saveMany
}

export const defaultRemoveMany = ( remove: DbRemove ) => {
  const removeMany: DbRemoveMany = async ids =>
    Promise.all( ids.map( remove ) ).then( () => {} )

  return removeMany
}
