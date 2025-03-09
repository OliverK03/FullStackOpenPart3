const express = require('express')
const morgan = require('morgan')
const app = express()
const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)


let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

morgan.token('body', (req) => {
    return req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : ''
})

app.use(express.json())
app.use(morgan((tokens, req, res) => {
    const log = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
    ]
    if (req.method == 'POST' || req.method == 'PUT') {
        log.push(tokens.body(req, res))
    }
    return log.join(' ')
}))

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(person => person.id))
        : 0
    return maxId + 1
}

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'Name is missing!'
        })
    }

    if (!body.number) {
        return res.status(400).json({
            error: 'Number is missing!'
        })
    }

    if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'Name must be unique!'
        })
    }

    const person = {
        id: String(generateId()),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)

    res.json(person)
})