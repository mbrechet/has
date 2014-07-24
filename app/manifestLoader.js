ManifestLoader = function(){
	this.manifest = null;
}

ManifestLoader.prototype.load = function(/*url*/ url){
	var xhr = new XMLHttpRequest();
	var deferred = Q.defer();
	xhr.open("GET",url,true);
	xhr.responseType =	"text";
	xhr.onload = (function(){
		deferred = this.onHaveManifest(xhr.response);
	}).bind(this);
	xhr.send();
	return deferred.promise;
}

ManifestLoader.prototype.onHaveManifest = function(data) {
	
	var deferred = Q.defer();
	var parser =  new DOMParser();
	var xmlManifest = parser.parseFromString(data,"text/xml",0);
	console.info("data ::: ",xmlManifest);		
	deferred.resolve(xmlManifest);
	return deferred.promise;
};

ManifestLoader.prototype.onError = function(e) {
	// body...
};