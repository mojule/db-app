import { promises } from 'fs'

import {
  DbIds, DbCreate, DbLoad, DbSave, DbRemove, DbCollection
} from '../../types'

import {
  defaultLoadMany, defaultCreateMany, defaultSaveMany, defaultRemoveMany
} from '../../default-many'
import { defaultFind, defaultFindOne } from '../../default-query'
import { defaultLoadPaged } from '../../default-load-paged'
import { randId } from '../../util'

const { readFile, writeFile, readdir, unlink, stat } = promises

export const createCollection = <Entity>(
  path: string
) => {
  const filePath = ( id: string ) => `${ path }/${ id }.json`

  const ids: DbIds = async () => {
    const fileIds =
      ( await readdir( path ) )
        .filter( s => s.endsWith( '.json' ) )
        .map( s => s.replace( /\.json$/, '' ) )

    return fileIds
  }

  const create: DbCreate<Entity> = async entity => {
    const _id = randId()
    const dbEntity = Object.assign( { _id }, entity )
    const json = JSON.stringify( dbEntity )

    await writeFile( filePath( _id ), json, 'utf8' )

    return _id
  }

  const createMany = defaultCreateMany( create )

  const load: DbLoad<Entity> = async id => {
    const json = await readFile( filePath( id ), 'utf8' )
    const dbEntity = JSON.parse( json )

    return dbEntity
  }

  const loadMany = defaultLoadMany( load )

  const save: DbSave<Entity> = async document => {
    const { _id } = document

    if ( typeof _id !== 'string' )
      throw Error( 'Expected document to have _id:string' )

    // must exist
    await stat( filePath( _id ) )

    const json = JSON.stringify( document )

    await writeFile( filePath( _id ), json, 'utf8' )
  }

  const saveMany = defaultSaveMany( save )

  const remove: DbRemove = async id => {
    await unlink( filePath( id ) )
  }

  const removeMany = defaultRemoveMany( remove )

  const find = defaultFind( ids, loadMany )
  const findOne = defaultFindOne( ids, loadMany )

  const loadPaged = defaultLoadPaged( ids, loadMany )

  const entityCollection: DbCollection<Entity> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
