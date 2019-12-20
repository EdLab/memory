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
const generateHTML = (event) => {
  const stamp = moment(event.startDate).format('YYYYMMDDHH')
  const name = `${stamp}-${event.slug}.html`
  event.startDateTxt = moment(event.startDate).format('lll')
  if (event.endDate)
    event.endDateTxt = moment(event.endDate).format('lll')
  return new Promise((resolve, reject) => {
    ejs.renderFile('./events/template.html', event, {}, function (err, str) {
      if (err) {
        return reject(err)
      }
      console.log(`${name}`)
      return resolve(str)
    });
  })
  .then((str) => {
    fs.writeFileSync(`./events/${name}`, str)
  })
}

axios
  .get('https://d2rb2alnsyighd.cloudfront.net/events.json')
  .then(function ({
    data
  }) {
    const {
      events
    } = data
    events.forEach((event) => {
      queue.add(()=>generateHTML(event));
    })
    // queue.add(() => generateHTML(events[0]));
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