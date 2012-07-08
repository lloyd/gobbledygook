const gobbledygook = require('./');

const tests = [
  [ "I LOVE YOU",
    "∩O⅄ ƎɅO⅂ I" ],
  [ "%s uses Persona to sign you in!",
    "¡uı noʎ uƃıs oʇ auosɹǝԀ sǝsn %s" ],
  [ "Please close this window, <a %s>enable cookies</a> and try again",
    "uıaƃa ʎɹʇ pua <a %s>sǝıʞooɔ ǝʅqauǝ</a> ´ʍopuıʍ sıɥʇ ǝsoʅɔ ǝsaǝʅԀ" ],
  [ "Please close this window, <a %(cookieLink)>enable <b>super dooper %(persona)</b> cookies</a> and try again",
    "uıaƃa ʎɹʇ pua <a %(cookieLink)>sǝıʞooɔ <b>%(persona) ɹǝdoop ɹǝdns</b> ǝʅqauǝ</a> ´ʍopuıʍ sıɥʇ ǝsoʅɔ ǝsaǝʅԀ" ],
  [ "%(aWebsite) uses Persona to sign you in!",
    "¡uı noʎ uƃıs oʇ auosɹǝԀ sǝsn %(aWebsite)" ]
];

var success = 0;

tests.forEach(function(t) {
  var translated = gobbledygook(t[0]);
  if (translated !== t[1]) {
    console.log("failure!  expected:", t[1]);
    console.log("               got:", translated);
  } else {
    success++;
  }
});

console.log(success + "/" + tests.length + " tests pass");
process.exit((success === tests.length) ? 0 : 1);
