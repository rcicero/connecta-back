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
    body: JSON.stringify(data),
    json: true
	};
}

// Map endpoints data
const endpoints = '<br> GET /' +
									'<br> GET api/user/:id' +
									'<br> GET api/user/:id/transaction' +
									'<br> GET api/user/:id1/transaction/:id2' +
									'<br> PUT api/user/:id/transaction' +
									'<br> GET api/user/:id/creditcard' +
									'<br> GET api/user/:id1/creditcard/:id2'

const list_endpoints = (res, data) => res.send("<pre>" + data + "</pre>")
const success_response = (res, data) => res.json(getSuccessResponseModel(data))
const error_response = (res, error) => res.json(getErrorResponseModel(error))

// Routing. E.g.: app.put('/api/name/:id', (req, res) => myfunction(req.params.id, req.body.extras, res))

app.get('/', (req, res) => list_endpoints(res, endpoints))

app.get('/api/user/:id', (req, res) => getUserAccount(res, [req.params.id]))

app.get('/api/user/:id/transaction', (req, res) => getAllUserTransaction(res, [req.params.id]))

app.get('/api/user/:id1/transaction/:id2', (req, res) => getUserTransaction(res, [req.params.id1, req.params.id2]))

app.put('/api/user/:id/transaction', (req, res) => updateTransaction(res, [req.body.transaction["_id"]], req.body.transaction["_source"]))

app.get('/api/user/:id/creditcard', (req, res) => getAllCreditCard(res, [req.params.id]))

app.get('/api/user/:id1/creditcard/:id2', (req, res) => getCreditCard(res, [req.params.id1, req.params.id2]))

app.get('/api/user/:id1/creditcard/:id2/transaction', (req, res) => getCreditCardTransaction(res, [req.params.id1, req.params.id2]))

app.get('/api/user/:id/loan', (req, res) => getLoan(res, [req.params.id]))

app.get('/api/user/:id/investiment', (req, res) => getInvestiment(res, [req.params.id]))

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

function getCreditCardTransaction(res, params) {
	rp(createGetOptions("cardtransactions/transaction/_search?card_id=%s", params[1]))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse)
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function updateTransaction(res, params, data) {
	console.log(params)
	console.log(data)
	rp(createPutOptions("transactions/transaction/%s", params[0], data))
    .then(function (promisseResponse) {
    		console.log(promisseResponse)
        success_response(res, "success")
    })
    .catch(function (error) {
    		console.log(error)
      	error_response(res, error)
    });
}

function getLoan(res, params) {
	rp(createGetOptions("loans/_search", []))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse)
    })
    .catch(function (error) {
      	error_response(res, error)
    });
}

function getInvestiment(res, params) {
	rp(createGetOptions("investments/_search", []))
    .then(function (promisseResponse) {
        success_response(res, promisseResponse)
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
