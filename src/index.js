const express = require('express')

const app = express()

const account = ['one', 'two', 'three', 'four', 'five']

app.get('/account', (req, res) => {
    return res.json(account)
})

app.listen(3333, () => {
    console.log('App running on http://localhost:3333.')
})