import * as DataStore from 'nedb'
import { defaultSaveMany, defaultRemoveMany } from '../../default-many'

import {
  DbIds, DbCreate, DbLoad, DbSave, DbRemove, DbCollection, DbItem, DbLoadMany,
  DbCreateMany, DbFind, DbFindOne
} from '../../types'

import { defaultLoadPaged } from '../../default-load-paged'

export const createCollection = <TEntity>(
  collection: DataStore
) => {
  const ids: DbIds = () => new Promise( ( resolve, reject ) => {
    collection.find( {}, { _id: 1 } ).exec( ( err, docs ) => {
      if ( err ) return reject( err )

      resolve( docs.map( d => String( d._id ) ) )
    } )
  } )

  const create: DbCreate<TEntity> = async entity =>
    new Promise<string>( ( resolve, reject ) => {
      collection.insert( entity, ( err, doc ) => {
        if ( err ) return reject( err )

        resolve( doc[ '_id' ] )
      } )
    } )

  const createMany: DbCreateMany<TEntity> = async entities =>
    new Promise<string[]>( ( resolve, reject ) => {
      collection.insert( entities, ( err, docs ) => {
        if ( err ) return reject( err )

        resolve( docs.map( doc => doc[ '_id' ] ) )
      } )
    } )

  const load: DbLoad<TEntity> = async id =>
    new Promise<TEntity & DbItem>( ( resolve, reject ) => {
      collection.findOne( { _id: id }, ( err, doc ) => {
        if ( err ) return reject( err )

        if ( doc === null )
          return reject( Error( `Expected entity for ${ id }` ) )

        resolve( <TEntity & DbItem>doc )
      } )
    } )

  const loadMany: DbLoadMany<TEntity> = async ids =>
    new Promise<( TEntity & DbItem )[]>( ( resolve, reject ) => {
      collection.find( { _id: { $in: ids } }, {}, ( err, docs ) => {
        if ( err ) return reject( err )

        resolve( <( TEntity & DbItem )[]>docs )
      } )
    } )

  const save: DbSave<TEntity> = async document =>
    new Promise<void>( ( resolve, reject ) => {
      const { _id } = document

      if ( typeof _id !== 'string' )
        return reject( Error( 'Expected document to have _id:string' ) )

      collection.update(
        { _id },
        document,
        { upsert: false },
        ( err, updated ) => {
          if ( err ) return reject( err )

          if ( updated === 0 )
            return reject( Error( `Expected entity for ${ _id }` ) )

          resolve()
        }
      )
    } )

  const saveMany = defaultSaveMany( save )

  const remove: DbRemove = async id =>
    new Promise<void>( ( resolve, reject ) => {
      collection.remove( { _id: id }, {}, ( err, removed ) => {
        if ( err ) return reject( err )

        if ( removed === 0 )
          return reject( Error( `Expected entity for ${ id }` ) )

        resolve()
      } )
    } )

  const removeMany = defaultRemoveMany( remove )

  const find: DbFind<TEntity> = async criteria =>
    new Promise<( TEntity & DbItem )[]>(
      ( resolve, reject ) => {
        collection.find(
          criteria,
          ( err: Error, documents: ( TEntity & DbItem )[] ) => {
            if ( err ) return reject( err )

            resolve( documents )
          }
        )
      }
    )

  const findOne: DbFindOne<TEntity> = async criteria =>
    new Promise<TEntity & DbItem | undefined>(
      ( resolve, reject ) => {
        collection.findOne(
          criteria,
          ( err: Error | null, document: TEntity & DbItem ) => {
            if ( err ) return reject( err )

            resolve( document || undefined )
          }
        )
      }
    )

  const loadPaged = defaultLoadPaged( ids, loadMany )

  const entityCollection: DbCollection<TEntity> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
