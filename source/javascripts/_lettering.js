// from https://gist.github.com/madrobby/1119059
var lettering = function(a,b){a.innerHTML=a.textContent.replace(b||/\S/g,function(c){return'<span class=char'+(a=-~a)+'>'+c+'</span>'})}
