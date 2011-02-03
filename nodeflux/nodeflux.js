var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	sys = require('sys'),
	md = require('./lib/markdown').Markdown,
	paperboy = require('./lib/paperboy'),
	mongo = require('./lib/mongodb'),
	WEBROOT = path.join(path.dirname(__filename), 'docroot');

db = new mongo.Db('nodeflux',, new mongo.Server('127.0.0.1','27017', {}), {});
db.addListener("error", function(error) {
  console.log("Error connecting to mongo -- perhaps it isn't running?");
});

function display_404(url,req,res){
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write("&lt;h1&gt;404 Not Found&lt;/h1&gt;");
    res.end("The page you were looking for: "+url+" can not be found");
}

function create_slide(url,req,res)

http.createServer(function(req, res) {
    var ip = req.connection.remoteAddress;
    paperboy
       .deliver(WEBROOT, req, res)
       .addHeader('Expires', 300)
       .addHeader('X-PaperRoute', 'Node')
       .before(function() {
           sys.puts('About to deliver: '+req.url);
       })
       .after(function(statCode) {
           log(statCode, req.url, ip);
       })
       .error(function(statCode,msg) {
           res.writeHead(statCode, {'Content-Type': 'text/plain'});
           res.end("Error " + statCode);
           log(statCode, req.url, ip, msg);
       })
       .otherwise(function() {
           var url = require('url').parse(req.url);
           switch(url.pathname){
               case '/resume':
                   res.writeHead(200, {'Content-Type': 'text/html'});
               	   fs.readFile('resume.md','utf8', function(err, cr) {
               		   if(err) throw err;
               		   var html = md(cr);
               		   res.end(html);
               	   });
               	   break;
               case '/slide/create':
                    create_slide(url.pathname, req, res);
               default:
                   display_404(url.pathname, req, res);
                   break;
           }
       });
}).listen(8080, "127.0.0.1");

function log(statCode, url, ip, err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err)
    logStr += ' - ' + err;
  console.log(logStr);
}

console.log('Server running at http://127.0.0.1:8080/');

