const ejs = require('ejs')
const axios = require('axios')
const fs = require('fs')
const moment = require('moment')
const v = require('voca');
const {
  default: PQueue
} = require('p-queue');
const queue = new PQueue({
  concurrency: 10,
  autoStart: false
});


const fetchImage = (url) => {
  //
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
const generateHTML = (blog) => {
  const stamp = moment(blog.publishedAt).format('YYYYMMDDHH')
  const name = `${stamp}-${blog.slug}.html`
  blog.publishedAtTxt = moment(blog.publishedAt).format('LL')
  return new Promise((resolve, reject) => {
    ejs.renderFile('./blogs/template.html', blog, {}, function (err, str) {
      if (err) {
        return reject(err)
      }
      console.log(`${name}`)
      return resolve(str)
    });
  })
  .then((str) => {
    fs.writeFileSync(`./blogs/${name}`, str)
  })
}

axios
  .get('https://d2rb2alnsyighd.cloudfront.net/articles.json')
  .then(function ({
    data
  }) {
    const {
      articles: blogs
    } = data
    blogs.forEach((blog) => {
      queue.add(()=>generateHTML(blog));
    })
    // queue.add(() => generateHTML(blogs[0]));
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