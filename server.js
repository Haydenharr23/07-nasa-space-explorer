const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const port = Number(process.env.PORT) || 8000;
const rootDirectory = __dirname;
const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.jpg': 'image/jpeg',
	'.png': 'image/png'
};

function sendJson(response, statusCode, data) {
	response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
	response.end(JSON.stringify(data));
}

function isValidDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

async function handleApodRequest(requestUrl, response) {
	const startDate = requestUrl.searchParams.get('start_date');
	const endDate = requestUrl.searchParams.get('end_date');
	const apiKey = process.env.NASA_API_KEY;

	if (!apiKey) {
		sendJson(response, 503, { error: { message: 'Set the NASA_API_KEY environment variable before starting the server.' } });
		return;
	}

	if (!startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate)) {
		sendJson(response, 400, { error: { message: 'Provide valid start_date and end_date values.' } });
		return;
	}

	const dayDifference = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000;
	if (dayDifference !== 8) {
		sendJson(response, 400, { error: { message: 'Choose a date range that includes exactly 9 days.' } });
		return;
	}

	const nasaUrl = new URL('https://api.nasa.gov/planetary/apod');
	nasaUrl.search = new URLSearchParams({
		start_date: startDate,
		end_date: endDate,
		thumbs: 'true',
		api_key: apiKey
	});

	try {
		const nasaResponse = await fetch(nasaUrl);
		const responseBody = await nasaResponse.text();
		response.writeHead(nasaResponse.status, { 'Content-Type': 'application/json; charset=utf-8' });
		response.end(responseBody);
	} catch (error) {
		console.error('Unable to request NASA APOD data:', error);
		sendJson(response, 502, { error: { message: 'Could not connect to NASA. Check your connection and try again.' } });
	}
}

async function handleStaticRequest(requestUrl, response) {
	let requestedPath;

	try {
		requestedPath = decodeURIComponent(requestUrl.pathname);
	} catch {
		sendJson(response, 400, { error: { message: 'Invalid URL path.' } });
		return;
	}

	const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
	const filePath = path.resolve(rootDirectory, relativePath);
	const pathFromRoot = path.relative(rootDirectory, filePath);

	if (pathFromRoot.startsWith('..') || path.isAbsolute(pathFromRoot)) {
		sendJson(response, 404, { error: { message: 'File not found.' } });
		return;
	}

	try {
		const fileContents = await fs.readFile(filePath);
		const contentType = contentTypes[path.extname(filePath)];

		if (!contentType) {
			sendJson(response, 404, { error: { message: 'File not found.' } });
			return;
		}

		response.writeHead(200, { 'Content-Type': contentType });
		response.end(fileContents);
	} catch (error) {
		if (error.code === 'ENOENT' || error.code === 'EISDIR') {
			sendJson(response, 404, { error: { message: 'File not found.' } });
			return;
		}

		console.error('Unable to serve requested file:', error);
		sendJson(response, 500, { error: { message: 'Could not load this page.' } });
	}
}

const server = http.createServer(async (request, response) => {
	if (request.method !== 'GET') {
		response.writeHead(405, { Allow: 'GET' });
		response.end();
		return;
	}

	const requestUrl = new URL(request.url, 'http://localhost');
	if (requestUrl.pathname === '/api/apod') {
		await handleApodRequest(requestUrl, response);
		return;
	}

	await handleStaticRequest(requestUrl, response);
});

server.listen(port, '0.0.0.0', () => {
	console.info(`NASA Space Explorer is running at http://localhost:${port}`);
});
