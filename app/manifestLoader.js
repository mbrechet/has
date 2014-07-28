var ManifestLoader = function(){
	this.manifest = null;
};

ManifestLoader.prototype.load = function(/*url*/ url){
	var xhr = new XMLHttpRequest();
	var deferred = Q.defer();
	xhr.open("GET",url,true);
	xhr.responseType =	"text";
	xhr.onload = (function(){
		this.onHaveManifest(xhr.response);
		deferred.resolve(this.manifest);
	}).bind(this);
	xhr.send();
	return deferred.promise;
};

ManifestLoader.prototype.onHaveManifest = function(data) {
	
	var parser =  new DOMParser();
	var xmlManifest = parser.parseFromString(data,"text/xml",0);
	this.manifest  = xml2json(xmlManifest)["#document"];	
};

ManifestLoader.prototype.onError = function(e) {
	// body...
};