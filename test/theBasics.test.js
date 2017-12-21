const { MongoClient } = require('mongodb')
const geocoder = require('geocoder-geojson')

let client, db, collection
// const url = 'mongodb://localhost:27017'
const url = process.env.COSMOSDB_URL
const dbName = 'test'
describe('Talking to the Database', () => {
  beforeEach(async () => {
    client = await MongoClient.connect(url)
    db = client.db(dbName)
    collection = db.collection('buildings')
    // CosmosDB apparently automatically indexes everything
    // but for Mongo we need to add an index
    // await collection.createIndex({ location: '2dsphere' })
  })

  afterEach(async () => {
    await collection.remove()
    client.close()
  })

  it('successfully saves a document', async () => {
    let expected = {
      _id: expect.anything(),
      a: expect.any(Number),
    }
    let { ops: [doc] } = await collection.insert({ a: 1 })
    expect(doc).toEqual(expected)
  })

  it('can loop over documents returned', async () => {
    await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }])
    var mockCallback = jest.fn()
    let cursor = await collection.find()
    while (await cursor.hasNext()) {
      await cursor.next()
      mockCallback()
    }
    expect(mockCallback.mock.calls.length).toEqual(3)
  })

  it('it can update documents in the collection', async () => {
    // Arrange
    await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }])
    var mockCallback = jest.fn()

    // Act
    let cursor = await collection.find()
    while (await cursor.hasNext()) {
      let doc = await cursor.next()
      await collection.update(doc, { $set: { b: 1 } })
    }

    let updated = await collection.findOne({ a: 1 })

    // Assert
    expect(updated.b).toEqual(1)
  })

  it('it can find geocoded things', async () => {
    // Insert two geocoded entities
    await collection.insertMany([
      {
        city: 'Ottawa, Canada',
        location: {
          type: 'Point',
          coordinates: [-75.69719309999999, 45.4215296],
        },
        bbox: [-76.35391589999999, 44.962733, -75.2465979, 45.5375801],
      },
      {
        city: 'Moscow, Russia',
        location: { type: 'Point', coordinates: [37.6172999, 55.755826] },
        bbox: [37.3193289, 55.48992699999999, 37.9456611, 56.009657],
      },
    ])

    // Ask for the one closest to Toronto
    let cursor = await collection.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [-79.3831843, 43.653226] },
          $maxDistance: 500000,
        },
      },
    })

    let results = await cursor.toArray()
    console.log('Query produced: ', results)

    // We expect 1 result: Ottawa
    expect(results.length).toEqual(1)
    expect(results[0].city).toEqual('Ottawa, Canada')
  })
})

describe('Geocoding things', () => {
  xit('returns a lat/lng given a place name', async () => {
    let { features: [{ geometry }] } = await geocoder.google('Ottawa, ON')
    expect(geometry.coordinates).toEqual([-75.69719309999999, 45.4215296])
  })
})
