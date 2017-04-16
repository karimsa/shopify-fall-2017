# Data Engineering Problem

Joins two JSON array files into a single joined array.

## Usage

```sh
$ ./index.js
usage: ./index.js [type] <file_one> <file_two> <key_one> <key_two>

Where [type] can be: inner or outer.
```

**Sample usage:**

```sh
$ ./index.js inner sample/customers.json sample/orders.json cid customer_id
[will print JSON array]
```