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

const fetchImage = (url) => {
  return  axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(({
        data,
        headers
      }) => {
        const imgBuffer = Buffer.from(data, 'binary').toString('base64')
        return Promise.resolve(`data:${headers['content-type']};base64,${imgBuffer}`)
      })
      .catch((e)=>{
        return Promise.resolve()
      })
}
const generateHTML = (project) => {
  const name = `${v.slugify(project.title)}__${project.pid}.html`
  return new Promise((resolve, reject) => {
    ejs.renderFile('./projects/template.html', project, {}, function (err, str) {
      if (err) {
        return reject(err)
      }
      console.log(`${name}`)
      return resolve(str)
    });
  })
  .then((str) => {
    fs.writeFileSync(`./projects/${name}`, str)
  })
}

axios
  .get('https://d2rb2alnsyighd.cloudfront.net/projects.json')
  .then(function ({
    data
  }) {
    const {
      projects
    } = data
    projects.forEach((project) => {
      queue.add(()=>generateHTML(project));
    })
    // queue.add(() => generateHTML(projects[0]));
    console.log(`Total: ${queue.size} in Queue`)
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function (str) {
    (async () => {
      queue.start()
      await queue.onIdle(() => {});
      console.log('Done!');
    })();
  });