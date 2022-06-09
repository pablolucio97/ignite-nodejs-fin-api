const express = require('express')
const { v4: uuidv4} = require('uuid')

const app = express()

app.use(express.json())

const customers = []

//CREATE AN ACCOUNT

app.post('/account', (req, res) => {
    const {cpf, name} = req.body
    const id = uuidv4()

    customers.push({
        cpf,
        name,
        id,
        statement: []
    })

    return res.status(201).send()
})

app.get('/account', (req, res) => {
    return res.json(account)
})

app.listen(3333, () => {
    console.log('App running on http://localhost:3333.')
})