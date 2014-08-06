var ManifestLoader = function(){
	this.baseUrl = "";
};

ManifestLoader.prototype.load = function(/*url*/ url){
	var xhr = new XMLHttpRequest();
	var deferred = Q.defer();
	this.baseUrl = url.substring(0, url.lastIndexOf("/")+1);
	console.info("baseUrl",this.baseUrl);
	xhr.open("GET",url,true);
	xhr.responseType =	"text";
	xhr.onload = (function(){
		deferred.resolve(this.onHaveManifest(xhr.response));
	}).bind(this);
	xhr.send();
	return deferred.promise;
};

ManifestLoader.prototype.onHaveManifest = function(data) {
	var jsonManifest = xml2json(data,{attrkey:"__proto__",charkey:"_",normalize:false});
	// ici on construit un objet Model manifest qui nous intéresse  partir des élément reçus
	return this.processManifest(jsonManifest);;
};

ManifestLoader.prototype.onError = function(e) {
	// body...
};


ManifestLoader.prototype.processManifest = function(jsonManifest) {

	var manifest = new ManifestModel();
	manifest.setType(jsonManifest.MPD.type);
	manifest.setMinBufferTime(this.parseDuration(jsonManifest.MPD.minBufferTime));
	manifest.setMediaPresentationduration(this.parseDuration(jsonManifest.MPD.mediaPresentationDuration));
	manifest.setMaxSegmentDuration(this.parseDuration(jsonManifest.MPD.maxSegmentDuration));
	manifest.setBaseUrl(jsonManifest.MPD.baseUrl || this.baseUrl);

	// on va recréer les AdpatationSet video et audio
	// ce player ne va géré qu'une seule périod
	var period = Array.isArray(jsonManifest.MPD.Period)? jsonManifest.MPD.Period[0] : jsonManifest.MPD.Period;
	var adaptationSets = Array.isArray(period.AdaptationSet) ? period.AdaptationSet : [period.AdaptationSet];
	
	
	for(var i=0; i<adaptationSets.length;i++){
		var adaptationSet = adaptationSets[i];
		if(adaptationSet.mimeType.indexOf("video")!=-1){
			manifest.setVideoSet(adaptationSet);
		}
		if(adaptationSet.mimeType.indexOf("audio")!=-1){
			manifest.setAudioSet(adaptationSet);
		}

		// here comes text
	}

	return manifest;
};
// fonction qui transofrme une durée iso 8601 en seconde
ManifestLoader.prototype.parseDuration = function(isoDuration) {
	  // format PYMTHMS
      var durationRegex = /^P(([\d.]*)Y)?(([\d.]*)M)?(([\d.]*)D)?T?(([\d.]*)H)?(([\d.]*)M)?(([\d.]*)S)?/;
      var match = durationRegex.exec(isoDuration);
      console.info("Matching de la durée ::: ",isoDuration,match);
      // on retrouve les valeur qui nous intéress au position 2,4,6,8,10,12
       return  (parseFloat(match[2] || 0) * ManifestLoader.SECONDS_IN_YEAR +
       			parseFloat(match[4] || 0) * ManifestLoader.SECONDS_IN_MONTH+
       			parseFloat(match[6] || 0) * ManifestLoader.SECONDS_IN_DAY+
       			parseFloat(match[8] || 0) * ManifestLoader.SECONDS_IN_HOUR+
       			parseFloat(match[10] || 0) * ManifestLoader.SECONDS_IN_MIN+
       			parseFloat(match[12] || 0));

};

// constants
ManifestLoader.SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
ManifestLoader.SECONDS_IN_MONTH = 30 * 24 * 60 * 60; // not precise!
ManifestLoader.SECONDS_IN_DAY = 24 * 60 * 60;
ManifestLoader.SECONDS_IN_HOUR = 60 * 60;
ManifestLoader.SECONDS_IN_MIN = 60;