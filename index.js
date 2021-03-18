const express = require('express')
const axios = require('axios')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const secret = 'nodeJs'
const urlEncodedParser = bodyParser.urlencoded({ extended: false })
const app = express()
const PORT = process.env.PORT || 5000 // this is very important
const urlArticle = 'https://projet-fcc3.restdb.io/rest/article'
const urlAccount = 'https://projet-fcc3.restdb.io/rest/account'

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
        } catch (err) {
            console.log(err)
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
        } catch (err) {
            console.log(err)
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
            console.log(error)
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
        } catch (error) {
            console.log(error)
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
    } catch (err) {
        console.log(err)
    }
}

const jwtStrategy = new JwtStrategy(jwtOptions, function(payload, next) {
    // usually this would be a database call:


    getUsers().then((result) => {
        user = result.find((user) => user.email === payload.user)
        if (user) {
            next(null, user)
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
        } catch (err) {
            console.log(err);
        }
    }

    async function deleteItem() {
        try {
            let newURL = urlArticle + "/" + req.params.id
            const response = await axios.delete(newURL, config)
            return response
        } catch (error) {
            console.log(error);
        }
    }

    async function getEmailArticle() {
        try {
            const response = await axios.get(urlArticle, config)
            return response.data
        } catch (err) {
            console.log(err)
        }
    }

    deleteArticle().then((result) => {
        res.json(result)
    })


})

app.get('/update/:id', urlEncodedParser, passport.authenticate('jwt', { session: false }), function(req, res) {

    const config = {
        headers: {
            'x-apikey': '64deca382d0dfdd703b0682ab81fb3266fd2d',
            'cache-control': 'no-cache',
        },
    }
    let data = {}
    console.log(req.body);
    async function updateArticle() {
        console.log("updateArticle");
        getEmailArticle().then((result) => {
            console.log("getEmail then")
            if (req.user.email == result[0].email) {
                console.log(req.body);
                if (typeof req.body["nom"] != "undefined") {
                    data["nom"] = req.body["nom"]
                }
                if (typeof req.body["description"] != "undefined") {
                    data["description"] = req.body["description"]
                }
                if (typeof req.body["prix"] != "undefined") {
                    data["prix"] = req.body["prix"]
                }
                console.log(data);
                updateArticleRequest()
            } else {
                res.status(401).json({ error: 'User do not match.' })
            }
        })
    }
    /**
     * Envoie de la requete de mise à jour
     */
    async function updateArticleRequest() {
        console.log("updateData");
        const urlUpdate = urlArticle + "/" + req.params.id
        console.log(urlArticle)
        console.log(urlUpdate)
        try {
            const response = await axios.put(urlUpdate, data, config)
            return response
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Récupération de l'email du créateur de l'article
     */
    async function getEmailArticle() {
        console.log("Email");
        try {
            const response = await axios.get(urlArticle, config)
            return response.data
        } catch (err) {
            console.log(err)
        }
    }

    updateArticle().then((result) => {
        res.json(result)
    })
})

nunjucks.configure('views', {
    autoescape: true,
    express: app,
})

app.listen(PORT, function() {
    console.log('Example app listening on port ' + PORT)
})