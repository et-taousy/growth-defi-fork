const http = require('http');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

let busy = false;

http.createServer((request, response) => {

  console.log('request ', request.url);

  let filePath = '.' + request.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  if (request.method == 'POST') {
    if (filePath == './restart') {
      if (busy) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Wait a bit, the service is already restarting');
        return;
      }
      busy = true;
      child_process.exec('docker restart ganache-cli', (error, stdout, stderr) => {
        if (error) {
          console.log(stderr);
          response.writeHead(200, { 'Content-Type': 'text/plain' });
          response.end(stderr, 'utf-8');
          busy = false;
          return;
        }
        setTimeout(() => {
          child_process.exec('npm run deploy', (error, stdout, stderr) => {
            if (error) {
              console.log(stderr);
              response.writeHead(200, { 'Content-Type': 'text/plain' });
              response.end(stderr, 'utf-8');
              busy = false;
              return;
            }
            console.log(stdout);
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(stdout, 'utf-8');
            busy = false;
          });
        }, 15000);
      });
      return;
    }
  }

/*
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        fs.readFile('./404.html', (error, content) => {
          response.writeHead(404, { 'Content-Type': 'text/html' });
          response.end(content, 'utf-8');
        });
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
*/

}).listen(8000);
console.log('Server running at http://127.0.0.1:8000/');
