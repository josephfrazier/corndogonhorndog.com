var fallback = false;
fallbackString = '<object type="application/x-shockwave-flash" data="conc.swf"><param name="loop" value="true" /></object>';
function appendObject() {
  adiv = document.getElementById('audio')
  adiv.innerHTML = fallbackString;
}
try {
  AudioContext = window.AudioContext || window.webkitAudioContext;
  window.actxt = new AudioContext();
  window.actxt.unlocked = false;

} catch (e) {
  fallback = true;

  if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function(){ appendObject(); } );}
  else {
    document.attachEvent("onreadystatechange", function(){ appendObject(); } );}
}

if (!fallback) {
  window.bgmSource = window.actxt.createBufferSource();
  window.bgmGain = window.actxt.createGain();
} 

function unlock() {
  if (fallback || window.actxt.unlocked) return;

  // create empty buffer and play it
  var buffer = window.actxt.createBuffer(1, 1, 22050);
  var source = window.actxt.createBufferSource();
  source.buffer = buffer;
  source.connect(window.actxt.destination);
  source.start(0);

  // by checking the play state after some time, we know if we're really unlocked
  setTimeout(function() {
    if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
      window.actxt.unlocked = true;
    }
  }, 1);
}

function toggleMute(){
  if (window.bgmGain.gain.value == 1) {
    window.bgmGain.gain.value = -1;
  } else {
    window.bgmGain.gain.value = 1;
  }
}

function init(){
    var request = new XMLHttpRequest()
    request.addEventListener( 'load', function( e ){
      window.actxt.decodeAudioData(request.response, function(decoded_data){
          window.bgmGain.gain.value = 1;
          window.bgmGain.connect( window.actxt.destination );
          window.bgmSource.buffer = decoded_data;
          window.bgmSource.connect( window.bgmGain );
          window.bgmSource.connect( window.actxt.destination );
          window.bgmSource.loop = true;

          window.bgmSource.start(0)
        }, 
        function( e ){ console.log( e ); }
      );
    }, false );

    request.open( 'GET', '/assets/conc.mp3', true );
    request.responseType = "arraybuffer";

    request.send();
  };

// init bgm unless we're in flash fallback
if (!fallback) document.addEventListener( 'DOMContentLoaded', function(){ init(); }, false );
