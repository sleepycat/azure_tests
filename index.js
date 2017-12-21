const { MongoClient } = require('mongodb')
const geocoder = require('geocoder-geojson')

let client, db, collection
const url = 'mongodb://localhost:27017'

const dbName = 'test'
// const dbName = 'nrcan'
const geocode = async () => {
  client = await MongoClient.connect(url)
  db = client.db(dbName)
  collection = db.collection('buildings')
  await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }])

  let cursor = await collection.find()
  while (await cursor.hasNext()) {
    let doc = await cursor.next()
    console.log(doc)
    await collection.update(doc, { $set: { b: 1 } })
  }

  await collection.drop()
}

console.log('geocoding data')
geocode().then(() => client.close())
