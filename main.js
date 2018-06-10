let express = require('express')
let bodyParser = require('body-parser')
let rp = require('request-promise');
let app = express()

// Basic configuration
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(8080, () => {
	console.log("Server running.")
})

// Infrastructure
const map_to_array = (map) => {
	let list = []
	Object.keys(map).forEach(key => list.push(map[key]))
	return list
}

function getSuccessResponseModel(data) {
	return {status: 200, result: data}
}

function getErrorResponseModel(error) {
	return {status: error.statusCode, result: error.message}
}

function createGetOptions(endpoint, param) {
	return {
    uri: 'http://40.114.27.240:9200/' + endpoint + param,
    json: true
	};
}

// Map endpoints data
const endpoints = {
	0: {id: 0, api: 'home'},
	1: {id: 1, api: 'user'}
}

const home = (res) =>	res.send('Hello ;)')
const success_response = (res, data) => res.json(getSuccessResponseModel(data))
const error_response = (res, error) => res.json(getErrorResponseModel(error))

// Routing. E.g.: app.put('/api/name/:id', (req, res) => myfunction(req.params.id, req.body.extras, res))
app.get('/', (req, res) => home(res))

app.get('/api', (req, res) => list_endpoints(res))

app.get('/api/user/:id', (req, res) => getUserAccount(res, req.params.id))

// server requests
function getUserAccount(res, userId) {
	rp(createGetOptions("accounts/account/", userId))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse)
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}
