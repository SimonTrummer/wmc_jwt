const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'userdb',
    password: 'postgres',
    port: 5432,
})

function generateAccessToken(user) {
    return jwt.sign(
        {
            name: user.name,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '5m' }
    );
}


// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401) // No token, unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403) // Invalid token, forbidden
        req.user = user
        next() // Proceed to the next middleware/route handler
    })
}

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).send('Username and password are required.')

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username])
        if (existingUser.rows.length > 0) return res.status(409).send('User already exists.')

        const hashedPassword = await bcrypt.hash(password, 10)

        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword])
        res.status(201).send('User registered successfully.')
    } catch (err) {
        res.status(500).send('Error registering user.')
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).send('Username and password are required.')

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username])
        if (user.rows.length === 0) return res.status(404).send('User not found.')

        if (await bcrypt.compare(password, user.rows[0].password)) {
            const accessToken = generateAccessToken({
                name: user.rows[0].username,
                id: user.rows[0].id,
                role: user.rows[0].role
            });

            const refreshToken = jwt.sign({ name: user.rows[0].username }, process.env.REFRESH_TOKEN_SECRET)

            await pool.query('INSERT INTO tokens (token) VALUES ($1)', [refreshToken])

            res.json({ accessToken, refreshToken })
        } else {
            res.status(403).send('Invalid credentials.')
        }
    } catch (err) {
        res.status(500).send('Error logging in.')
    }
})

// Protect the /portal route with the JWT verification middleware
app.get('/portal', authenticateToken, async (req, res) => {
    const services = [
        { name: "Test Microservice", path: "http://localhost:5173/" },
        { name: "dreck2", path: "localhost:3001" }
    ]

    res.json({ services })
})

app.post('/token', async (req, res) => {
    const { token: refreshToken } = req.body
    if (!refreshToken) return res.sendStatus(401)

    try {
        const storedToken = await pool.query('SELECT * FROM tokens WHERE token = $1', [refreshToken])
        if (storedToken.rows.length === 0) return res.sendStatus(403)

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            const accessToken = generateAccessToken({
                name: user.rows[0].username,
                id: user.rows[0].id,
                role: user.rows[0].role
            });

            res.json({ accessToken })
        })
    } catch (err) {
        res.status(500).send('Error refreshing token.')
    }
})

app.post('/validate-token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);
    console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        res.json({ user });
    });
});


app.delete('/logout', async (req, res) => {
    const { token: refreshToken } = req.body

    try {
        await pool.query('DELETE FROM tokens WHERE token = $1', [refreshToken])
        res.sendStatus(204)
    } catch (err) {
        res.status(500).send('Error logging out.')
    }
})

app.listen(4000, () => {
    console.log('Server running on port 4000')
})
