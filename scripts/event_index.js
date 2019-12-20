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
    const events = fs.readdirSync("./events").filter(function(file) {
        if (file.indexOf("-") > -1)
          return file
    })
    const eventArray = events.map((event) => {
        const slug = event
        const name = event.split('.')[0].split('-')
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
    generateFile(eventArray)

}

const generateFile = (eventArray) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile('./events/template_index.html', { data: eventArray }, {}, function (err, str) {
            if (err) {
                return reject(err)
            }
            return resolve(str)
        });
    })
        .then((str) => {
            fs.writeFileSync("./events/index.html", str)
        })
}

generateIndex()



