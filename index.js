const express = require('express')
const axios = require('axios')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const cors = require('cors')
const secret = 'nodeJs'
const urlEncodedParser = bodyParser.urlencoded({ extended: false })
const app = express()
const PORT = process.env.PORT || 5000 // this is very important
const urlArticle = 'https://projet-fcc3.restdb.io/rest/article'
const urlAccount = 'https://projet-fcc3.restdb.io/rest/account'

app.use(cors())

var corsOptions = {
    origin: function(origin, callback) {
        // db.loadOrigins is an example call to load
        // a list of origins from a backing database
        db.loadOrigins(function(error, origins) {
            callback(error, origins)
        })
    }
}

/**
 * Listes de tous les articles
 */
app.get('/articles', function(req, res) {
    async function getArticles() {
        let articles
        try {
            articles = await axios.get(urlArticle, {
                headers: {
                    'cache-control': 'no-cache',
                    'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d',
                },
            })
            return articles.data
        } catch (error) {
            console.log(error.response.data);
        }
    }

    getArticles().then((result) => {
        res.json(result)
    })
})

/**
 * Détail d'un article
 */
app.get('/articles/:id', function(req, res) {
    const config = {
        params: {
            q: { _id: req.params.id },
        },
        headers: { 'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d' },
    }
    async function articleRead() {
        try {
            const response = await axios.get(urlArticle, config)
            console.log(response.data)
            return response.data
        } catch (error) {
            console.log(error.response.data);
        }
    }

    articleRead().then((result) => {
        res.json(result)
    })
})

/**
 * Ajout d'un article
 */
app.post('/newArticle', passport.authenticate('jwt', { session: false }), urlEncodedParser, function(req, res) {
    async function addArticle() {
        try {
            let data = {
                nom: req.body['nom'],
                description: req.body['description'],
                prix: req.body['prix'],
                email: req.user.email,
            }
            const config = {
                headers: { 'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d' },
            }
            let newArticle = await axios.post(urlArticle, data, config)
            return newArticle
        } catch (error) {
            console.log(error.response.data);
        }
    }
    addArticle().then((result) => {
        res.json(result)
    })
})

/**
 * Ajout d'un user
 */
app.post('/newAccount', urlEncodedParser, function(req, res) {
    async function addUser() {
        try {
            let data = {
                email: req.body['email'],
                password: req.body['password'],
            }
            const config = {
                headers: { 'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d' },
            }
            let user = await axios.post(urlAccount, data, config)
            return user
        } catch (error) {
            console.log(error.response.data);
        }
    }
    addUser().then((result) => {
        res.json(result)
    })
})

const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
}

async function getUsers() {
    let users
    try {
        users = await axios.get(urlAccount, {
            headers: {
                'cache-control': 'no-cache',
                'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d',
            },
        })
        return users.data
    } catch (error) {
        console.log(error.response.data);
    }
}

const jwtStrategy = new JwtStrategy(jwtOptions, function(payload, next) {
    // usually this would be a database call:


    getUsers().then((result) => {
        let userResult = result.find((user) => user.email === payload.user)
        if (userResult) {
            next(null, userResult)
        } else {
            next(null, false)
        }
    })
})

passport.use(jwtStrategy)
app.post('/login', urlEncodedParser, (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        res.status(401).json({ error: 'Email or password was not provided.' })
        return
    }

    getUsers().then((result) => {
        const user = result.find((user) => user.email === email)
        if (!user || user.password !== password) {
            res.status(401).json({ error: 'Email / password do not match.' })
            return
        }

        const userJwt = jwt.sign({ user: user.email }, secret)
        res.json({ jwt: userJwt })
    })

})

app.get('/removeArticle/:id', passport.authenticate('jwt', { session: false }), function(req, res) {
    const config = {
        headers: { 'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d' },
    }

    async function deleteArticle() {
        try {
            getEmailArticle().then((result) => {
                if (req.user.email == result[0].email) {
                    try {
                        deleteItem().then((responseDelete) => {
                            return responseDelete
                        })
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    res.status(401).json({ error: 'User do not match.' })
                }
            })
        } catch (error) {
            console.log(error.response.data);
        }
    }

    async function deleteItem() {
        try {
            let newURL = urlArticle + "/" + req.params.id
            const response = await axios.delete(newURL, config)
            return response
        } catch (error) {
            console.log(error.response.data);
        }
    }

    async function getEmailArticle() {
        try {
            const response = await axios.get(urlArticle, config)
            return response.data
        } catch (error) {
            console.log(error.response.data);
        }
    }

    deleteArticle().then((result) => {
        res.json(result)
    })


})

app.post('/update/:id', urlEncodedParser, passport.authenticate('jwt', { session: false }), function(req, res) {


    const config = {
        headers: {
            'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d',
            'cache-control': 'no-cache',
        },
    }
    let data = {}
    async function updateArticle() {
        try {
            getEmailArticle().then((result) => {
                data = result[0]
                if (req.user.email == result[0].email) {
                    if (typeof req.body.nom != "undefined") {
                        data.nom = req.body.nom
                    }
                    if (typeof req.body.description != "undefined") {
                        data.description = req.body.description
                    }
                    if (typeof req.body.prix != "undefined") {
                        data.prix = req.body.prix
                    }

                    updateArticleRequest()
                } else {
                    res.status(401).json({ error: 'User do not match.' })
                }
            })
        } catch (error) { console.log(error.response.data) }
    }
    /**
     * Envoie de la requete de mise à jour
     */
    async function updateArticleRequest() {
        const urlUpdate = urlArticle + "/" + req.params.id
        try {
            const response = await axios.put(urlUpdate, data, config)
            return response
        } catch (error) {
            console.log(error.response.data);
        }
    }

    /**
     * Récupération de l'email du créateur de l'article
     */
    async function getEmailArticle() {
        try {
            const response = await axios.get(urlArticle, config)
            return response.data
        } catch (error) {
            console.log(error.response.data);
        }
    }

    try {
        updateArticle().then((result) => {
            res.json(result)
        })
    } catch (error) { console.log(error.response.data) }
})

nunjucks.configure('views', {
    autoescape: true,
    express: app,
})

app.listen(PORT, function() {
    console.log('Example app listening on port ' + PORT)
})