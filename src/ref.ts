import { DbRef, EntityDb } from './types'

export const isRef = <EntityMap>( ref: any ): ref is DbRef<EntityMap> => {
  if ( !ref ) return false
  if ( typeof ref._id !== 'string' ) return false
  if ( typeof ref._collection !== 'string' ) return false

  return true
}

export const isRefArray = <EntityMap>( arg: any[] ): arg is DbRef<EntityMap>[] => {
  if ( !Array.isArray( arg ) ) return false
  if ( !arg.every( isRef ) ) return false

  return true
}

export const resolveRef = async <EntityMap>(
  db: EntityDb<EntityMap>, ref: DbRef<EntityMap>
) => {
  const { _collection, _id } = ref
  const collection = db.collections[ _collection ]
  const dbEntity = await collection.load( _id )

  return dbEntity
}

export const resolveRefArray = async <EntityMap>(
  db: EntityDb<EntityMap>, refs: DbRef<EntityMap>[]
): Promise<EntityMap[ keyof EntityMap ][]> => {
  if( refs.length === 0 ) return []

  const [ first ] = refs
  const { _collection } = first
  const ids = refs.map( ref => ref._id )

  const dbEntitys = await db.collections[ _collection ].loadMany( ids )

  return dbEntitys
}

export const resolveRefsShallow = async <EntityMap, Entity>(
  db: EntityDb<EntityMap>, obj: Entity
) => {
  const result: Partial<Entity> = {}
  const keys = Object.keys( obj )

  for ( let i = 0; i < keys.length; i++ ) {
    const value = obj[ keys[ i ] ]

    if ( isRef<EntityMap>( value ) ) {
      result[ keys[ i ] ] = await resolveRef( db, value )
    } else if ( isRefArray<EntityMap>( value ) ) {
      result[ keys[ i ] ] = await resolveRefArray( db, value )
    } else {
      result[ keys[ i ] ] = value
    }
  }

  return <Entity>result
}

export const resolveRefsDeep = async <EntityMap, Entity>(
  db: EntityDb<EntityMap>, obj: Entity, depthLimit = 20
) => {
  const resolve = async<Entity>( obj: Entity, depth = 0 ) => {
    if( depth > depthLimit )
      throw Error( 'Exceeded depth limit' )

    const result: Partial<Entity> = {}
    const keys = Object.keys( obj )

    for ( let i = 0; i < keys.length; i++ ) {
      const value = obj[ keys[ i ] ]

      if ( isRef<EntityMap>( value ) ) {
        let entity = await resolveRef( db, value )

        result[ keys[ i ] ] = await resolve( entity, depth + 1 )
      } else if ( isRefArray<EntityMap>( value ) ) {
        let entities = await resolveRefArray( db, value )

        result[ keys[ i ] ] = await Promise.all(
          entities.map( e => resolve( e, depth + 1 ) )
        )
      } else {
        result[ keys[ i ] ] = value
      }
    }

    return <Entity>result
  }

  return resolve( obj )
}
