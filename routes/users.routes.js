const router = require("express").Router();

const User = require("../models/User.model.js");

const bcrypt = require("bcryptjs"); //npm i bcryptjs
const saltRounds = 10;  //numero de rondes d'encriptació. Habitualment 10-12
const isLoggedIn = require("../middleware/isLoggedIn.js");
const isLoggedOut = require("../middleware/isLoggedOut.js");

//rutes d'usuari
router.get("/login", isLoggedOut, (req, res, next)=>{
    res.render("users/login");
})
router.post("/login", isLoggedOut, (req, res, next)=>{

    const { username, password } = req.body;

    User.findOne({username})
    .then(user => { 
        //user.password -> encriptat
        //password -> en clar (desencriptat)

        if(bcrypt.compareSync(password, user.password)) {
            req.session.currentUser=user;   
            res.redirect("/users/profile");
        } else {
            const data = {missatgeError: "credencials incorrectes"};
            if(req.session.currentUser) data.username = req.session.currentUser.username;

            res.render("users/login", data)
        }

    })
    .catch(err => {
        res.render("error", {missatgeError: err})   //renderitzo vista /views/error.hbs
    })
})

router.get("/signin", isLoggedOut, (req, res, next)=>{
    const data = {};
    if(req.session.currentUser) data.username = req.session.currentUser.username;
    res.render("users/signin", data);
})
router.post("/signin", isLoggedOut, (req, res, next)=>{
    const {username, password, passwordRepeat} = req.body;
    // const username = req.body.username;
    // const password = req.body.password;
    // const passwordRepeat = req.body.passwordRepeat;

    if(!username || !password  || !passwordRepeat) {
        const data = {missatgeError: "Falten camps"};
        //if(req.session.currentUser) data.username = req.session.currentUser.username;
        
        res.render("users/signin", data);
        return;
    }
    if(password != passwordRepeat) {
        const data = {missatgeError: "Passwords diferents"};
        if(req.session.currentUser) data.username = req.session.currentUser.username;

        res.render("users/signin", data);
        return;
    }

    //genero la "salt" a partir del numero de rondes definides a dalt de tot
    const salt = bcrypt.genSaltSync(saltRounds);
  
    //amb la salt generada al pas anterior, encripto password
    const passwordHash = bcrypt.hashSync(password, salt);

    User.create({
        username,
        password: passwordHash
    })
    .then(result => {
        req.session.currentUser=result;   
        res.redirect("/users/profile");     //torno a carregar una ruta: localhost:3000/users/profile
    })
    .catch(err => {
        const data = {missatgeError: err};
        if(req.session.currentUser) data.username = req.session.currentUser.username;

        // res.render("error", data)   //renderitzo vista /views/error.hbs
        next(err);
    })
})

router.get("/profile", isLoggedIn ,(req, res, next)=>{
    const data = {missatgeError: "Passwords diferents"};
    if(req.session.currentUser) data.username = req.session.currentUser.username;

    res.render("users/profile", data);    //renderitza vista /views/users/profile.hbs
});

router.get("/logout", isLoggedIn, (req, res, next)=>{
    req.session.destroy(err => {
        console.log("ja no tenim sessió ", err);
        res.redirect("/users/login");
    });
})

module.exports = router;