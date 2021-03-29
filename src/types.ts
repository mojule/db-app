export type DbEntity<Entity> = Entity & DbItem

export interface DbCreate<Entity> {
  ( entity: Entity ): Promise<string>
}

export interface DbCreateMany<Entity> {
  ( entities: Entity[] ): Promise<string[]>
}

export interface DbLoad<Entity> {
  ( id: string ): Promise<DbEntity<Entity>>
}

export interface DbLoadMany<Entity> {
  ( ids: string[] ): Promise<DbEntity<Entity>[]>
}

export interface DbSave<Entity> {
  ( document: DbEntity<Entity> ): Promise<void>
}

export interface DbSaveMany<Entity> {
  ( documents: DbEntity<Entity>[] ): Promise<void>
}

export interface DbRemove {
  ( id: string ): Promise<void>
}

export interface DbRemoveMany {
  ( ids: string[] ): Promise<void>
}

export interface DbIds {
  (): Promise<string[]>
}

export interface DbFind<Entity> {
  ( criteria: any ): Promise<DbEntity<Entity>[]>
}


export interface DbFindOne<Entity> {
  ( criteria: any ): Promise<DbEntity<Entity> | undefined>
}

export interface DbLoadPaged<Entity> {
  ( pageSize: number, pageIndex?: number ): Promise<DbEntity<Entity>[]>
}

export interface DbCollection<Entity> {
  ids: DbIds
  create: DbCreate<Entity>
  createMany: DbCreateMany<Entity>
  load: DbLoad<Entity>
  loadMany: DbLoadMany<Entity>
  save: DbSave<Entity>
  saveMany: DbSaveMany<Entity>
  remove: DbRemove
  removeMany: DbRemoveMany
  find: DbFind<Entity>
  findOne: DbFindOne<Entity>
  loadPaged: DbLoadPaged<Entity>
}

export interface EntityDb<EntityMap> {
  drop: () => Promise<void>
  close: () => Promise<void>
  collections: DbCollections<EntityMap>
}

export interface EntitySchemaDb<EntityMap,SchemaMap> extends EntityDb<EntityMap> {
  getAllSchema: () => Promise<SchemaMap>
}

export type DbCollections<EntityMap> = {
  [ key in keyof EntityMap ]: DbCollection<EntityMap[ key ]>
}

export interface DbItem {
  _id: string
}

export interface DbRef<EntityMap> extends DbItem {
  _collection: keyof EntityMap
}

export interface CreateDb<EntityMap, Keys, Options = any> {
  ( name: string, keys: Keys, options?: Options ):
    Promise<EntityDb<EntityMap>>
}
