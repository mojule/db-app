export const createSequence = <T>(
  length: number, cb: ( index: number ) => T
) => Array.from( { length }, ( _v, k ) => cb( k ) )

export const randInt = ( exclMax: number ) =>
  Math.floor( Math.random() * exclMax )

export const randId = ( length = 24 ) =>
  createSequence(
    length,
    () => randInt( 16 )
  ).map(
    v => v.toString( 16 )
  ).join( '' )