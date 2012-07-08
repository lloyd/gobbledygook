// This file contains a persona-specific "fake translation" implementation.
//
// Fake translation is the process of agorithmically translating text into
// something can visually been seen to have been derived from the original
// text, but is also significantly different.
//
// Fake translation is useful because once you "translate" a portion of UI,
// you can scan it to ensure that all user facing strings are properly
// extracted, and that we didn't forget to mark up strings in our code anywhere.
//
// Our fake translation is a right-to-left representation of english, using
// several unicode characters to represent to make it look like all the strings
// are upside down and backwards - you can still read it kinda, and you can
// clearly see that it's messed up (and hence, the text is properly being extracted).
//
// Concretely, we test a couple different things at once here:
// 1. our rendering of R-T-L languages
// 2. our string extraction / string markup
// 3. our substitution system and its ability to allow translators to reposition
//    things (like move the privacy policy before the terms and we still sub links right)
//
// IMPLEMENTATION DETAILS:
//
// This implementation supports basic HTML markup and substitution markers.
//
// Because we directly use very simple html in strings we expose
// to translators, this thing has to understand very basic html.  Here's a concrete
// example:
//   real - Please close this window, <a %s>enable cookies</a> and try again
//   fake - uıaƃa ʎɹʇ pua <a %s>sǝıʞooɔ ǝʅqauǝ</a> ´ʍopuıʍ sıɥʇ ǝsoʅɔ ǝsaǝʅԀ
//
// notice that the text within the full sentence must be inverted, however HTML
// tags must not be.
//
// Positional
//
// We use substitution markers %s and %(name) in translatable strings as placeholders
// where dynamically generated content (links, email addresses, website names, etc)
// will be placed.  Needless to say, if `%(cookieLink)` is translated to
// `)ʞuı⅂ǝıʞooɔ(%`, our substitution will be broken.  This implementation respects
// these types of markers, and is currently hardcoded to only support our style,
// but could be generalized.


// take a string and turn it into an array of tokens.  Tokens are:
// 1. text: plain text chunks
// 2. markers: untranslatable place holders %s or %(name)
// 3. containers: like, <a> </a>. things containing text that should be translated,
//    but the things must retain their order
function tokenize(str) {
  // Yeah, I'm using regular expressions to process html.  don't look at me like that.
  // the HTML we're processing MUST be used sparingly and only when required to represent
  // boundaries of phrases in larger sentence, where context is important to translators.
  // so don't look at me like that.
  var toks = str.split(/(%s|%\([^)]+\)|<[^>]+>.*<\/[^>]+>)/).filter(function(x) { return x.length != 0; } );

  // yay, tokens!  now we need to process the non-text tokens
  var toks;
  for (var i = 0; i < toks.length; i++) {
    // first, handle markers
    if (toks[i][0] === '%') {
      toks[i] = { t: 'marker', v: toks[i] };
    } else if (toks[i][0] = '<') {
      // NOTE: this is a greedy match.  that combined with recursion allows us to
      // handle nested tags.
      var m = /^(<[^>]+>)(.*)(<\/[^>]+>)$/.exec(toks[i]);
      if (m) toks[i] = { t: 'container', b: m[1], e: m[3], v: tokenize(m[2]) };
    }
    // text tokens we just leave alone
  }

  return toks;
}

// take a token array and turn it into a translated string, inverting the order
function stringify(toks) {
  var str = "";
  for (var i = toks.length - 1; i >= 0; i--) {
    if (typeof toks[i] === 'string') str += toks[i];
    else if (toks[i].t == 'marker') str += toks[i].v;
    else {
      str += toks[i].b + stringify(toks[i].v) + toks[i].e;
    }
  }
  return str;
}

const from = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+\\|`~[{]};:'\",<.>/?";
const to =   "ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz∀ԐↃᗡƎℲ⅁HIſӼ⅂WNOԀÒᴚS⊥∩ɅＭX⅄Z0123456789¡@#$%ᵥ⅋⁎()-_=+\\|,~[{]};:,„´<.>/¿";

// translate a single string, inverting it as well
function translateString(str) {
  var trans = "";
  for (var i = str.length - 1; i >= 0; i--) {
    var ix = from.indexOf(str.charAt(i));
    if (ix > 0) trans += to[ix];
    else trans += str[i];
  }
  return trans;
}

function translateToks(toks) {
  for (var i = 0; i < toks.length; i++) {
    if (typeof toks[i] === 'string') toks[i] = translateString(toks[i]);
    else if (toks[i].t === 'container') {
      if (typeof toks[i].v === 'string') toks[i].v = translateString(toks[i].v);
      else translateToks(toks[i].v);
    }
  }
}

// translate a string
exports.translate = function(str) {
  var toks = tokenize(str);
  translateToks(toks);
  return stringify(toks);
};

var tests = [
  "I LOVE YOU",
  "%s uses Persona to sign you in!",
  "Please close this window, <a %s>enable cookies</a> and try again",
  "Please close this window, <a %(cookieLink)>enable <b>super dooper %(persona)</b> cookies</a> and try again",
  "%(aWebsite) uses Persona to sign you in!"
];

console.log(translateString("Please close this window, <a %(cookieLink)>enable <b>super dooper %(persona)</b> cookies</a> and try again"));

tests.forEach(function(t) {
  console.log('>', t);
  console.log('T', tokenize(t));
  console.log('<', exports.translate(t));
});
