const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

function verifyAccountCPFExists(req, res, next) {
    const { cpf } = req.headers

    const customer = customers.find(customer => customer.cpf === parseInt(cpf))
    if (!customer) {
        return res.status(201).json({ error: "Customer not found" })
    }

    req.customer = customer

    return next()
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount
        } else {
            return acc - operation.amount
        }
    }, 0)
    return balance
}


//CREATE AN ACCOUNT - IF AN ACCOUNT DOESN'T ALREADY EXIST

app.post('/account', (req, res) => {
    const { cpf, name } = req.body

    const customerAlreadyExists = customers.find(customer => customer.cpf === parseInt(cpf))

    if (customerAlreadyExists) {
        return res.status(400).json({ error: 'Customer already exists' })
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })

    return res.status(201).send()
})

//CREATE A DEPOSIT

app.post('/deposit', verifyAccountCPFExists, (req, res) => {


    const { description, amount } = req.body

    const { customer } = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()

})

//CREATE A WITHDRAW - IF THE ACCOUNT EXISTS

app.post('/withdraw', verifyAccountCPFExists, (req, res) => {
    const { customer } = req
    const { amount } = req.body

    const balance = getBalance(customer.statement)

    if (balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()

})

//READ ACCOUNT STATEMENT - IF THE ACCOUNT EXISTS

app.get('/statement', verifyAccountCPFExists, (req, res) => {

    const { customer } = req

    return res.json(customer.statement)
})

//READ ACCOUNT BALANCE - IF THE ACCOUNT EXISTS

app.get('/balance', verifyAccountCPFExists, (req, res) => {

    const { customer } = req

    const balance = getBalance(customer.statement)

    return res.status(200).json(balance)

})

//READ ACCOUNT STATEMENT BY DATE- IF THE ACCOUNT EXISTS

app.get('/statement/date', verifyAccountCPFExists, (req, res) => {

    const { customer } = req
    const { date } = req.query

    const dateFormat = new Date(date + " 00:00")

    const statement = customer.statement
        .filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

    return res.json(statement)
})

//READ ACCOUNT DETAILS - IF THE ACCOUNT EXISTS

app.get('/account', verifyAccountCPFExists, (req, res) => {

    const { customer } = req

    return res.json(customer)
})

//UPDATE ACCOUNT NAME - IF THE ACCOUNT EXISTS

app.put('/account', verifyAccountCPFExists, (req, res) => {
    const { customer } = req
    const { name } = req.body

    customer.name = name

    return res.status(201).send()
})

//DELETE ACCOUNT - IF THE ACCOUNT EXISTS

app.delete('/account', verifyAccountCPFExists, (req, res) => {
    const { customer } = req
    customers.splice(customer, 1)
    return res.status(200).json(customers)
})

app.listen(3333, () => {
    console.log('App running on http://localhost:3333.')
})