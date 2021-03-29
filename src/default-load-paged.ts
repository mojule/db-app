import { DbIds, DbLoadMany, DbLoadPaged } from './types'

export const defaultLoadPaged = <Entity>(
  ids: DbIds, loadMany: DbLoadMany<Entity>
) => {
  const loadPaged: DbLoadPaged<Entity> = async (
    pageSize: number, pageIndex = 0
  ) => {
    const entityIds = await ids()
    const start = pageIndex * pageSize
    const end = start + pageSize
    const pageIds = entityIds.slice( start, end )

    const entities = await loadMany( pageIds )

    return entities
  }

  return loadPaged
}
