var ManifestLoader = function(){
	this.manifest = null;
	this.baseUrl = "";
};

ManifestLoader.prototype.load = function(/*url*/ url){
	var xhr = new XMLHttpRequest();
	var deferred = Q.defer();
	this.manifest = null;
	this.baseUrl = url.substring(0, url.lastIndexOf("/")+1);
	console.info("baseUrl",this.baseUrl);
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
	
	
	var jsonManifest = xml2json(data,{attrkey:"__proto__",charkey:"_",normalize:false});

	// ici on construit un objet Model manifest qui nous intéresse  partir des élément reçus
	// todo extraire le model dans une classe à part

	this.manifest  = this.processManifest(jsonManifest);
	return this.manifest;
};

ManifestLoader.prototype.onError = function(e) {
	// body...
};


ManifestLoader.prototype.processManifest = function(jsonManifest) {
	var manifest = {
		type: jsonManifest.MPD.type,
		minBufferTime: this.parseDuration(jsonManifest.MPD.minBufferTime),
		mediaPresentationDuration: this.parseDuration(jsonManifest.MPD.mediaPresentationDuration),
		maxSegmentDuration: this.parseDuration(jsonManifest.MPD.maxSegmentDuration),
		baseUrl: jsonManifest.MPD.baseUrl || this.baseUrl,
	};

	// on va recréer les AdpatationSet video et audio
	// ce player ne va géré qu'une seule périod
	var period = Array.isArray(jsonManifest.MPD.Period)? jsonManifest.MPD.Period[0] : jsonManifest.MPD.Period;
	var adaptationSets = Array.isArray(period.AdaptationSet) ? period.AdaptationSet : [period.AdaptationSet];
	
	// on définit des fonction associées à notre objet "model" manifest
	var getRepresentation = function(type,id){
		if(type ==="video"){
			var videoRepresentation = Array.isArray(this.videoSet.Representation) ? this.videoSet.Representation : [this.videoSet.Representation];

			if(id){
				for (var i = 0; i <videoRepresentation.length; i++) {
					if(videoRepresentation[i].id === id){
						return videoRepresentation[i];
					}
				}
				return null;
			}else{
				return videoRepresentation[0] || null;
			}
		}

		if(type ==="audio"){
			var audioRepresentation = Array.isArray(this.audioSet.Representation) ? this.audioSet.Representation : [this.audioSet.Representation];
			if(id){
				for (var j = 0; j <audioRepresentation.length; j++) {
					if(audioRepresentation[j].id === id){
						return audioRepresentation[j];
					}
				}
				return null;
			}else{
				return audioRepresentation[0] || null;
			}
		}
	};

	manifest.getRepresentation = getRepresentation;

	for(var i=0; i<adaptationSets.length;i++){
		var adaptationSet = adaptationSets[i];
		if(adaptationSet.mimeType.indexOf("video")!=-1){
			manifest.videoSet = adaptationSet;
		}
		if(adaptationSet.mimeType.indexOf("audio")!=-1){
			manifest.audioSet = adaptationSet;
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