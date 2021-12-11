let expect = require('expect')

var { generateMessage } = require('./message')

describe('Generate Message', () => {
  it('should generate correct message object', () => {
    const from = 'Ming-Wang'
    const text = 'Some random text'
    message = generateMessage(from, text)

    expect(typeof message.createdAt).toBe('number')
    expect(message).toMatchObject({ from, text })
  })
})
