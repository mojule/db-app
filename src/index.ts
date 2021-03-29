import { DbEntity } from './types'

export const dbItemToEntity = <Entity>( dbItem: DbEntity<Entity> ): Entity => {
  const entity: Entity = Object.assign( {}, dbItem, { _id: undefined } )

  delete entity[ '_id' ]

  return entity
}
  
