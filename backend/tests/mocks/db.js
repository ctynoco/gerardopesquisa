const mockQuery = jest.fn()
const mockPool = { query: mockQuery, on: jest.fn() }

jest.mock('../../src/config/database', () => ({
  query: (...args) => mockQuery(...args),
  pool: mockPool,
}))

module.exports = { mockQuery, mockPool }
