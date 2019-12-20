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
function replaceAll(str, find, replace) {
    var escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}

const generateIndex = () => {
    fs.readdir('./projects', function (err, projects) {
        projects.sort()
        const projArray = projects.map((project) => {
            const slug = project
            const name = project.split('.')[0].split('__')
            name.pop()
            return {
                slug,
                name: replaceAll(v.titleCase(name.join(' ')), "-", " ")
            }
        })
        generateFile(projArray)
    });
}

const generateFile = (projArray) => {
    const displayData = projArray.map((proj)=>{
        return v.titleCase(proj)
    })

    return new Promise((resolve, reject) => {
        ejs.renderFile('./projects/template_index.html', { data: projArray }, {}, function (err, str) {
            if (err) {
                return reject(err)
            }
            return resolve(str)
        });
    })
        .then((str) => {
            fs.writeFileSync("./projects/index.html", str)
        })
}


generateIndex()



