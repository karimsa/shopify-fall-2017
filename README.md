# Solutions to the Shopify Fall 2017 Internship problems

## Prerequisites

 - [node.js v7.x](https://nodejs.org)
 - **npm v4.x** (comes with node.js)

## Backend Engineering Problem

```sh
$ node backend/index.js
{
  "remaining_cookies": 1,
  "unfulfilled_orders": [
    5,
    7,
    11
  ]
}
```

## Data Infrastructure Engineering Problem

```
$ node data-infrastructure/index.js
usage: shopijoin [type] <file_one> <file_two> <key_one> <key_two>

Where [type] can be: inner or outer.
$ node data-infrastructure/index.js inner data-infrastructure/sample/customers.json data-infrastructure/sample/orders.json customer_id cid
[lots of output - you can see for yourself]
$ node data-infrastructure/index.js outer data-infrastructure/sample/customers.json data-infrastructure/sample/orders.json customer_id cid
[lots of output - you can see for yourself]
```

## License

Licensed under [MIT license](LICENSE).