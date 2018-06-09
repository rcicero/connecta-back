let express = require('express')
let bodyParser = require('body-parser')
let app = express()

// Basic configuration
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(8080, function() {
	console.log("Server running.")
})

// Business logic
const map_to_array = (map) => {
	let list = []
	Object.keys(map).forEach(key => list.push(map[key]))
	return list
}

// Map data
const endpoints = {
	1: {id: 1, api: 'home'},
	2: {id: 2, api: 'api'}
}

const home = (res) =>	res.send('Hello ;)')
const list_endpoints = (res) => res.json(map_to_array(endpoints))

// Routing
app.get('/', (req, res) => home(res))

app.get('/api', (req, res) => list_endpoints(res))

//app.put('/api/name/:id', (req, res) => myfunction(req.params.id, req.body.extras, res))
