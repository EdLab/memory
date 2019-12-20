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
    fs.readdir('./profiles', function (err, profiles) {
        const profArray = profiles.map((profile) => {
            const slug = profile
            const name = profile.split('.')[0].split('-')
            name.shift()
            name.join(' ')
            return {
                slug,
                name: v.titleCase(name.join(' '))
            }
        })
        generateFile(profArray)
    });
}

const generateFile = (profArray) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile('./profiles/template_index.html', { data: profArray }, {}, function (err, str) {
            if (err) {
                return reject(err)
            }
            return resolve(str)
        });
    })
        .then((str) => {
            fs.writeFileSync("./profiles/index.html", str)
        })
}


generateIndex()



