const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const Category = require('../models/Category')
const User = require('../models/User')

router.get('/', (req, res) => {
    console.log(req.session)
    res.render('site/index')
})

/* router.get('/admin', (req, res) => {
    res.render('admin/index')
}) */

router.get('/blog', (req, res) => {

    const postPerPage = 4 //sayfada gösterilecek post adeti
    const page = req.query.page || 1
    //populate ile authoru user modelinden alacaksın diyorum.
    Post.find({}).populate({path:'author', model: User}).sort({$natural:-1}).lean()
        //aggregate ile kategorilere ait post  sayılarını gönderiyorum
        .skip((postPerPage * page) - postPerPage)
        .limit(postPerPage)
        .then(posts => {
            
            Post.countDocuments().then(postCount => {
                Category.aggregate([
                    {
                        $lookup: {
                            from: 'posts',
                            localField: '_id', //kategoriye ait id
                            foreignField: 'category', //posttaki category
                            as: 'posts'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            num_of_posts: {$size: '$posts'}
                        }
                    }
                ]).then(categories => {
                    res.render('site/blog', {
                        posts:posts, 
                        categories:categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount/postPerPage)
                    })
                })
            })
        
    })
    
})

router.get('/contact', (req, res) => {
    res.render('site/contact')
})


module.exports = router