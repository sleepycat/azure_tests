# Some test code to explore Azure's CosmosDB

## Installing dependencies

```javascript
yarn
```
The code here assumes MongoDB is installed locally and listening on port 27017.
Additionally, connecting to Cosmos will require an environmental variable set
containing the connection string for a CosmosDB instance.

That might look like adding something like this to your ~/.bashrc file:

```sh
export COSMOSDB_URL="mongodb://my_connection_string"
```
If the `env` command shows COSMOSDB_URL being defined you are good to go.

## Running the tests

```javascript
yarn test
```
