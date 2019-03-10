const moment = require('moment-timezone');
const fetch = require('node-fetch');
require('dotenv').config()

const prometheus = process.env.PROMETHEUS_URL;
const sensorQuery = process.env.SENSOR_QUERY || 'sensor_outside{deviceId="60:01:94:5D:4C:9D"}';
const step = process.env.STEP || '5m';
const start = process.env.START || '2019-01-31T23:00:00.000Z';
const end = process.env.END || '2019-03-01T23:00:00.000Z';

const fetchArgs = {
	'headers': {
		'Authorization': process.env.AUTHORIZATION_HEADER
	}
}
fetch(`${prometheus}/query_range?query=${sensorQuery}&start=${start}&end=${end}&step=${step}`, fetchArgs).then(res => res.json()).then(result => {
	if (result.status && result.status === 'error') {
		return Promise.reject(Error(`Error: ${result.error}`))
	}
	const values = result.data.result[0].values;
	values.forEach(sample => {
		let datetime = moment.unix(sample[0]).tz('Europe/Copenhagen').format('Y-MM-DD HH:mm:ss');
		let date = moment.unix(sample[0]).tz('Europe/Copenhagen').format('DD-MM-Y');
		let time = moment.unix(sample[0]).tz('Europe/Copenhagen').format('HH:mm:ss');
		let sampleValue = sample[1];
		console.log(`${datetime};${date};${time};${sampleValue}`);
	})
	
}).catch(err => {
	console.log(err.message);
	process.exit(1);
})

