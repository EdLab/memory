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

const generateFile = (person) => {
  const name = `${person.uid}-${v.slugify(person.name)}.html`
  return new Promise((resolve, reject) => {
    ejs.renderFile('./profiles/template.html', person, {}, function (err, str) {
      if (err) {
        return reject(err)
      }
      console.log(`${name}`)
      return resolve(str)
    });
  })
    .then((str) => {
      fs.writeFileSync(`./profiles/${name}`, str)
    })
}
const fetchImage = (url) => {
  //
  return axios
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
    .catch((e) => {
      return Promise.resolve()
    })
}
const parsingData = (person) => {
  return Promise
    .all([fetchImage(person.picture || ''), fetchImage(`https://cdn.tc-library.org/Edlab/picture-${person.uid}.png`)])
    .then(([defaultImg, legacy]) => {
      person.picture = defaultImg || legacy
      return generateFile(person)
    })
}

axios
  .get('https://d2rb2alnsyighd.cloudfront.net/people.json')
  .then(function ({
    data
  }) {
    const {
      people
    } = data
    people.forEach((person) => {
      queue.add(() => parsingData(person));
    })
    // queue.add(() => parsingData(people[0]));
    console.log(`Total: ${queue.size} in Queue`)
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function (str) {
    (async () => {
      queue.start()
      await queue.onIdle(() => { });
      console.log('Done!');
    })();
  });