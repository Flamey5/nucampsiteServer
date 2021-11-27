const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((favorite) => {
                        if (!favorite.campsites.includes(favorite._id)) {
                            favorite.campsites.push(favorite._id);
                        }
                    });
                    favorite.save()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch((err) => next(err));
                } else {
                    Favorite.create({ user: req.user_id, campsites: req.body })
                        .then((favorite) => {
                            console.log('favorite Created', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    favorite.remove()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
          .then((favorite) => {
            if (favorite) {
              if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => next(err));
              } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That campsite is already a favorite!');
              }
            } else {
              Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
              .catch((err) => next(err));
            }
          })
          .catch((err) => next(err));
      })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
            .then((favorite) => {
                if(favorite) {
                    const index = favorite.campsites.indexOf(req.params.campsiteId);
                    if (index >= 0) {
                        favorite.campsites.splice(index, 1);
                    }
                    favorite.save()
                    .then((favorite) => {
                        Favorite.findById(favorite._id)
                        .then((favorite) => {
                            console.log('Favorite Campsite Deleted!', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }).catch((err)=> next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }
            }).catch((err) => next(err))
    });

   


  

module.exports = favoriteRouter;