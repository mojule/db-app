import * as DataStore from 'nedb'
import { EntityDb, DbCollections } from '../../types'
import { createCollection } from './create-collection'
import { kebabCase } from '../../../util/lodash'
import { defaultDrop } from '../../default-drop'
import { EntityKeys } from '../../../entity/types'
import { KeyValueMap } from '../../../util/types'
import { eachEntityKey } from '../../../entity/each-entity-key'

const loadDataStore = async (
  name: string, options?: DataStore.DataStoreOptions
) => {
  const store =
    options !== undefined ?
      new DataStore( options ) :
      new DataStore( name )

  return new Promise<DataStore>( ( resolve, reject ) => {
    store.loadDatabase( err => {
      if ( err ) return reject( err )

      resolve( store )
    } )
  } )
}

const initCollections = async <TEntityMap>(
  name: string, keys: EntityKeys<TEntityMap>, options?: DataStore.DataStoreOptions
) => {
  const collections: DbCollections<TEntityMap> = <any>{}
  const stores: KeyValueMap<TEntityMap, DataStore> = <any>{}

  await eachEntityKey( keys, async key => {
    const store = await loadDataStore(
      `./data/nedb/${ name }.${ key }.db`, options
    )

    collections[ key ] = createCollection( store )
    stores[ key ] = store
  } )

  return { stores, collections }
}

export const createNeDb = async <TEntityMap>(
  name: string, keys: EntityKeys<TEntityMap>,
  options?: DataStore.DataStoreOptions
) => {
  name = kebabCase( name )

  const drop = async () => defaultDrop( db )()
  const close = async () => { }

  const { collections } = await initCollections( name, keys, options )

  const db: EntityDb<TEntityMap> = { drop, close, collections }

  return db
}
