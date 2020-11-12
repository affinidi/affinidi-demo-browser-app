import decodeEnv from './decodeEnv'

describe('decodeEnv', () => {
  it('returns dev if given dev', () => {
    expect(decodeEnv('dev')).toBe('dev')
  })

  it('returns dev if given development', () => {
    expect(decodeEnv('development')).toBe('dev')
  })

  it('returns prod if given prod', () => {
    expect(decodeEnv('prod')).toBe('prod')
  })

  it('returns prod if given production', () => {
    expect(decodeEnv('production')).toBe('prod')
  })

  it('returns staging if given staging', () => {
    expect(decodeEnv('production')).toBe('prod')
  })

  it('returns staging if given anything else', () => {
    expect(decodeEnv('')).toBe('staging')
    expect(decodeEnv(null)).toBe('staging')
    expect(decodeEnv('test')).toBe('staging')
  })
})
