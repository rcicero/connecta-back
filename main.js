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
	var endpointCustom = parse(endpoint, param)
	
	return {
    uri: 'http://40.114.27.240:9200/' + endpointCustom,
    json: true
	};
}

function createPutOptions(endpoint, param, data) {
	var endpointCustom = parse(endpoint, param)

	return {
    uri: 'http://40.114.27.240:9200/' + endpointCustom,
    body: {
    	body: data
    },
    json: true
	};
}

// Map endpoints data
const endpoints = {
	0: {id: 0, api: 'GET /'},
	1: {id: 1, api: 'GET api/user/<id>'},
	2: {id: 2, api: 'GET api/user/<id>/transaction'},
	3: {id: 3, api: 'GET api/user/<id1>/transaction/<id2>'},
	4: {id: 4, api: 'PUT api/user/<id>/transaction'},
	5: {id: 5, api: 'GET api/user/<id>/creditcard'},
	6: {id: 6, api: 'GET api/user/<id1>/creditcard/<id2>'}
}

const success_response = (res, data) => res.json(getSuccessResponseModel(data))
const error_response = (res, error) => res.json(getErrorResponseModel(error))

// Routing. E.g.: app.put('/api/name/:id', (req, res) => myfunction(req.params.id, req.body.extras, res))

app.get('/', (req, res) => list_endpoints(res))

app.get('/api/user/:id', (req, res) => getUserAccount(res, [req.params.id]))

app.get('/api/user/:id/transaction', (req, res) => getAllUserTransaction(res, [req.params.id]))

app.get('/api/user/:id1/transaction/:id2', (req, res) => getUserTransaction(res, [req.params.id1, req.params.id2]))

app.put('/api/user/:id/transaction', (req, res) => updateTransaction(res, [req.body["_id"]], req.body))

app.get('/api/user/:id/creditcard', (req, res) => getAllCreditCard(res, [req.params.id]))

app.get('/api/user/:id1/creditcard/:id2', (req, res) => getCreditCard(res, [req.params.id1, req.params.id2]))

// server requests
function getUserAccount(res, params) {
	rp(createGetOptions("accounts/account/%s", params[0]))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse)
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function getAllUserTransaction(res, params) {
	rp(createGetOptions("transactions/transaction/_search?account=%s", params[0]))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse["hits"]["hits"])
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function getUserTransaction(res, params) {
	rp(createGetOptions("transactions/transaction/_search?account=%s", params[0]))
    .then(function (promisseResponse) {
    		let filteredTransactions = []
    		var transactions = promisseResponse["hits"]["hits"]

				transactions.forEach(function(extract) {
					var date = new Date(extract["_source"].timestamp)
					var month = date.getUTCMonth() + 1

					if (month == params[1]) {
						filteredTransactions.push(extract)
					}
				})

        success_response(res, filteredTransactions)
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function getAllCreditCard(res, params) {
	rp(createGetOptions("cards/_search?account=%s", params[0]))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse["hits"]["hits"])
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function getCreditCard(res, params) {
	rp(createGetOptions("cards/card/%s", params[1]))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse)
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function updateTransaction(res, params, data) {
	rp(createPutOptions("transactions/transaction/", params[0], data))
    .then(function (promisseResponse) {
        success_response(res, "success")
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function parse(str, arg) {
	  return str.replace(/%s/g, arg);
}

function parseMany(str, args) {
	  var i = 0;

	  return str.replace(/%s/g, function() {
	      return args[i++];
	  });
}
