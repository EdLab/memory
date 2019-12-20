const ejs = require('ejs')
const axios = require('axios')
const fs = require('fs')
const v = require('voca');
const {
    default: PQueue
} = require('p-queue');
const queue = new PQueue({
    concurrency: 10,
    autoStart: false
});


const generateIndex = () => {
    fs.readdir('./blogs', function (err, blogs) {
        const blogArray = blogs.map((blog) => {
            const slug = blog
            const name = blog.split('.')[0].split('-')
            const originDate = name.shift()
            const year = originDate.substring(0, 4);
            const month = originDate.substring(4, 6);
            const day = originDate.substring(6, 8);
            name.join(' ')
            return {
                slug,
                name: name.join(' '),
                date: `${year}-${month}-${day}`
            }
        })
        generateFile(blogArray)
    });
}

const generateFile = (blogArray) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile('./blogs/template_index.html', { data: blogArray }, {}, function (err, str) {
            if (err) {
                return reject(err)
            }
            return resolve(str)
        });
    })
        .then((str) => {
            fs.writeFileSync("./blogs/index.html", str)
        })
}


generateIndex()



