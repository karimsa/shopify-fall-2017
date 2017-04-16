// configure this
const ORDERS_API_ENDPOINT = 'https://backend-challenge-fall-2017.herokuapp.com/orders.json'

// deps
const _ = require('lodash')
    , request = require('request')

// get all orders, via promise
const getOrders = () => new Promise((resolve, reject) => {
  let page = 0
    , data = {
        remaining_cookies: 0,
        orders: []
      }

  const next = () => {
    page += 1

    // grab page
    request(`${ORDERS_API_ENDPOINT}?page=${page}`, (err, res, body) => {
      if (!err && (!res || res.statusCode > 399)) {
        err = new Error('Something went wrong.' + (res ? '' : ('(code: ' + res.statusCode + ')')))
      }

      // handle errors
      if (err) {
        return reject(err)
      }

      // parse body
      body = JSON.parse(body)

      // if orders is empty, we've hit the end of the list
      if ( body.orders.length === 0 ) {
        return resolve(data)
      }

      // append orders to list
      data.remaining_cookies = body.available_cookies
      data.orders = data.orders.concat(body.orders)

      // get next page
      next()
    })
  }

  next()
})

;(async () => {
  // go get orders and data
  const data = await getOrders()

  // filter orders
  data.orders = _.chain(data.orders)

      // if an order has been fulfilled, we don't care
      // about it
      .filter(order => order.fulfilled === false)

      // clean up product lists
      .map(order => {
        order.products = _.chain(order.products)
        
          // we only want to know about cookies
          .filter(product => {
            return product.title === 'Cookie'
          })

          // reduce to a number
          .reduce((sum, prod) => sum + prod.amount, 0)

          // run chain
          .value()

        return order
      })

      // only orders with cookies
      .filter(order => order.products > 0 && order.products < data.remaining_cookies)

      // prioritize
      .orderBy(['products', 'id'], ['desc', 'asc'])

      // fulfill orders, keep the unfulfilled
      .filter(order => {
        // only look at orders that can be fulfilled
        if (( data.remaining_cookies - order.products ) > 0) {
          data.remaining_cookies -= order.products
          return false
        }

        return true
      })

      // replace order with id
      .map(order => order.id)

      // run all chained methods
      .value()

  // write output
  console.log(JSON.stringify({
    remaining_cookies: data.remaining_cookies,
    unfulfilled_orders: data.orders
  }, null, 2))
})()
  .catch(err => console.error(err))