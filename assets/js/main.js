/*
  main.js: builds the home page from content.js and runs the interactive bits.
  You shouldn't need to edit this file to add content. Edit content.js instead.
*/
(function(){
  var S = window.SITE, P = S.person;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  /* ---------- helpers ---------- */
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function $(id){ return document.getElementById(id); }
  function visible(list){ return (list || []).filter(function(x){ return !x.hidden; }); }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
  // A stable "confidence score" per item, 93 to 98, so labels never change between visits.
  function conf(s){ var h = 0; for(var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return 93 + (h % 6); }
  function detect(label, score){ return ' data-detect="' + esc(label) + '" data-conf="' + (score || conf(label)) + '"'; }
  function pills(items){ return items && items.length ? '<ul class="stack" aria-label="Built with">' + items.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : ''; }
  function linkBtns(links){ return links && links.length ? '<div class="plinks">' + links.map(function(l){ return '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'; }).join('') + '</div>' : ''; }
  function statusLine(p){ return (p.highlight ? '<em>' + esc(p.highlight) + '</em>' + (p.status ? ', ' : '') : '') + esc(p.status || ''); }

  /* ---------- hero ---------- */
  document.title = P.firstName + ' ' + P.lastName;
  $('hero').innerHTML =
    '<div>' +
      '<h1>' + esc(P.firstName) + '<br>' + esc(P.lastName) + '</h1>' +
      '<p class="lede">' + esc(P.lede) + '</p>' +
      '<p class="sub">' + esc(P.intro) + '</p>' +
      '<div class="links">' +
        '<a class="btn primary" href="resume/">Resume</a>' +
        '<a class="btn" href="#work">See my work</a>' +
        '<a class="btn" href="' + esc(P.github) + '" target="_blank" rel="noopener">GitHub</a>' +
        '<a class="btn" href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a>' +
      '</div>' +
    '</div>' +
    '<figure class="portrait"><img id="photo" src="' + esc(P.photo) + '" alt="' + esc(P.photoAlt) + '" width="800" height="800"' +
      detect(slug(P.firstName + ' ' + P.lastName), 99) + '></figure>';

  /* ---------- projects ---------- */
  var projects = visible(S.projects);
  var featured = projects.filter(function(p){ return p.featured; })[0];
  var rest = projects.filter(function(p){ return p !== featured; });
  var html = '';
  if(featured){
    var desc = [].concat(featured.description || []);
    var hasDemo = featured.demo === 'recognition';
    html += '<div class="feature' + (hasDemo ? '' : ' no-demo') + '"' + detect(slug(featured.title)) + '><div>' +
      '<h3>' + esc(featured.title) + '</h3><p class="meta">' + statusLine(featured) + '</p>' +
      desc.map(function(d){ return '<p>' + esc(d) + '</p>'; }).join('') +
      (featured.facts ? '<ul class="facts">' + featured.facts.map(function(f){ return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '') +
      pills(featured.stack) + linkBtns(featured.links) +
      '</div>' + (hasDemo ? recognitionDemo() : '') + '</div>';
  }
  if(rest.length){
    html += '<ul class="rows">' + rest.map(function(p){
      return '<li class="row"' + detect(slug(p.title)) + '>' +
        '<div><h3>' + esc(p.title) + '</h3><span class="status">' + statusLine(p) + '</span></div>' +
        '<div><p>' + esc([].concat(p.description || []).join(' ')) + '</p>' + pills(p.stack) + linkBtns(p.links) + '</div></li>';
    }).join('') + '</ul>';
  }
  $('work-body').innerHTML = html;

  /* ---------- leadership ---------- */
  $('lead-body').innerHTML = visible(S.leadership).map(function(l){
    return '<article' + detect(slug(l.role)) + '><h3>' + esc(l.role) + '</h3><p class="org">' + esc(l.org) + '</p><p>' + esc(l.text) + '</p></article>';
  }).join('');

  /* ---------- skills and education ---------- */
  $('skills-body').innerHTML =
    '<dl class="skills"' + detect('skills', 98) + '>' + visible(S.skills).map(function(s){ return '<dt>' + esc(s.label) + '</dt><dd>' + esc(s.items) + '</dd>'; }).join('') + '</dl>' +
    '<div class="edu"' + detect('education', 99) + '>' + visible(S.education).map(function(e){
      return '<div class="item"><h3>' + esc(e.school) + '</h3>' + e.lines.map(function(l){ return '<p>' + esc(l) + '</p>'; }).join('') + '</div>';
    }).join('') + '</div>';

  /* ---------- contact and footer ---------- */
  $('contact-links').innerHTML =
    '<a class="email" href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a>' +
    '<div class="others"><a href="resume/">Resume</a><a href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a><a href="' + esc(P.github) + '" target="_blank" rel="noopener">GitHub</a></div>';
  $('footnote').textContent = P.footerNote;

  /* ---------- detection box ---------- */
  var det = $('det'), lab = $('detLabel'), current = null;
  function place(el){
    if(!el) return;
    current = el;
    var r = el.getBoundingClientRect(), pad = 12;
    det.style.transform = 'translate(' + (r.left + window.scrollX - pad) + 'px,' + (r.top + window.scrollY - pad) + 'px)';
    det.style.width = (r.width + pad*2) + 'px';
    det.style.height = (r.height + pad*2) + 'px';
    var score = el.getAttribute('data-conf');
    lab.textContent = el.getAttribute('data-detect') + ', ' + score + '% match';
    det.classList.add('on');
  }
  window.addEventListener('resize', function(){ if(current) place(current); });
  if(document.fonts) document.fonts.ready.then(function(){ if(current) place(current); });
  var photo = $('photo');
  function startDetect(){ setTimeout(function(){ place(photo); }, reduce ? 0 : 450); }
  if(photo.complete) startDetect(); else { photo.addEventListener('load', startDetect); photo.addEventListener('error', startDetect); }

  var targets = document.querySelectorAll('[data-detect]');
  if(fine){
    targets.forEach(function(el){ el.addEventListener('mouseenter', function(){ place(el); }); });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting) place(e.target); });
    }, {rootMargin:'-45% 0px -45% 0px'});
    targets.forEach(function(el){ io.observe(el); });
  }

  /* ---------- recognition demo ---------- */
  function recognitionDemo(){
    return '<figure class="cam" id="cam">' +
      '<svg viewBox="0 0 400 270" role="img" aria-labelledby="camTitle"><title id="camTitle">Illustrated camera view with three people. Running recognition labels all three at once.</title>' +
      '<rect width="400" height="270" fill="#1C2044"/><rect x="0" y="200" width="400" height="70" fill="#232852"/>' +
      '<rect x="38" y="150" width="84" height="120" rx="40" fill="#5E7CE2"/><circle cx="80" cy="112" r="34" fill="#E8B894"/><path d="M46 104 q34 -44 68 0 q-8 -26 -34 -28 q-26 2 -34 28z" fill="#3A2A22"/>' +
      '<rect x="158" y="136" width="90" height="134" rx="44" fill="#E9A400"/><circle cx="203" cy="94" r="36" fill="#B97E57"/><path d="M165 92 q38 -54 76 0 l0 40 q-6 -30 -12 -38 q-26 -12 -52 0 q-6 8 -12 38z" fill="#1E1614"/>' +
      '<rect x="284" y="158" width="80" height="112" rx="38" fill="#3FA38B"/><circle cx="324" cy="122" r="31" fill="#F1CDAE"/><path d="M293 116 q31 -40 62 0 q-4 -22 -31 -24 q-27 2 -31 24z" fill="#9B9B9B"/>' +
      '<rect class="scanline" x="0" y="0" width="400" height="3" fill="#F4B71C"/>' +
      '<g class="fbox"><rect class="frame" x="40" y="72" width="80" height="84" rx="3"/><rect class="tag" x="40" y="52" width="104" height="18" rx="3"/><text x="46" y="65">Sam, uncle</text></g>' +
      '<g class="fbox"><rect class="frame" x="161" y="52" width="84" height="88" rx="3"/><rect class="tag" x="161" y="32" width="112" height="18" rx="3"/><text x="167" y="45">Leila, sister</text></g>' +
      '<g class="fbox"><rect class="frame" x="287" y="85" width="74" height="76" rx="3"/><rect class="tag" x="266" y="65" width="116" height="18" rx="3"/><text x="272" y="78">Mr. Ortiz, doctor</text></g>' +
      '</svg><div class="bar"><p class="say" id="say" aria-live="polite">Tap run to see all three recognized at once.</p>' +
      '<button class="btn" id="scanBtn" type="button">Run recognition</button></div></figure>';
  }
  var cam = $('cam');
  if(cam){
    var btn = $('scanBtn'), say = $('say'), timers = [];
    var lines = ['This is Sam, your uncle.', 'This is Leila, your sister.', 'This is Mr. Ortiz, your doctor.'];
    btn.addEventListener('click', function(){
      timers.forEach(clearTimeout); timers = [];
      if(cam.classList.contains('scanned')){
        cam.classList.remove('scanned'); btn.textContent = 'Run recognition';
        say.textContent = 'Tap run to see all three recognized at once.'; return;
      }
      cam.classList.remove('scanning'); void cam.offsetWidth; cam.classList.add('scanning');
      say.textContent = 'Scanning the frame...';
      timers.push(setTimeout(function(){
        cam.classList.add('scanned'); cam.classList.remove('scanning'); btn.textContent = 'Reset';
        lines.forEach(function(l, i){
          timers.push(setTimeout(function(){ say.innerHTML = '3 faces found. Speaking: <strong>' + l + '</strong>'; }, i * 1700));
        });
      }, reduce ? 0 : 700));
    });
  }

  /* ---------- sticky nav: border once you scroll, underline the current section ---------- */
  var bar = $('topbar');
  window.addEventListener('scroll', function(){ bar.classList.toggle('scrolled', window.scrollY > 8); }, {passive:true});
  var navLinks = {};
  document.querySelectorAll('.nav ul a[href^="#"]').forEach(function(a){ navLinks[a.getAttribute('href').slice(1)] = a; });
  if('IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        Object.keys(navLinks).forEach(function(k){ navLinks[k].removeAttribute('aria-current'); });
        if(navLinks[e.target.id]) navLinks[e.target.id].setAttribute('aria-current', 'true');
      });
    }, {rootMargin:'-40% 0px -55% 0px'});
    ['hero','work','leadership','skills','contact'].forEach(function(id){ var el = $(id); if(el) spy.observe(el); });
  }

  /* ---------- terminal (press /) ---------- */
  var term = $('term'), out = $('out'), inp = $('termIn');
  function print(h){ var d = document.createElement('div'); d.innerHTML = h; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  function openTerm(){ term.classList.add('open'); inp.focus(); if(!out.childNodes.length) print('Hi, I\'m ' + esc(P.firstName) + '. Type <b>help</b> to see what you can do here.'); }
  function closeTerm(){ term.classList.remove('open'); }
  $('termClose').addEventListener('click', closeTerm);
  document.addEventListener('keydown', function(e){
    var t = e.target.tagName;
    if(e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA'){ e.preventDefault(); openTerm(); }
    if(e.key === 'Escape') closeTerm();
  });
  var cmds = {
    help: function(){ return 'Commands: <b>whoami</b>, <b>projects</b>, <b>skills</b>, <b>resume</b>, <b>contact</b>, <b>github</b>, <b>matrix</b>, <b>clear</b>, <b>exit</b>'; },
    whoami: function(){ return esc(P.firstName + ' ' + P.lastName + '. ' + P.intro); },
    projects: function(){ return projects.map(function(p){ return esc(p.title.toLowerCase()) + (p.highlight ? '  (' + esc(p.highlight.toLowerCase()) + ')' : ''); }).join('\n'); },
    skills: function(){ return visible(S.skills).map(function(s){ return esc(s.label.toLowerCase() + ': ' + s.items); }).join('\n'); },
    resume: function(){ setTimeout(function(){ location.href = 'resume/'; }, 400); return 'Opening resume...'; },
    contact: function(){ return '<a href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a>'; },
    github: function(){ return '<a href="' + esc(P.github) + '" target="_blank" rel="noopener">' + esc(P.github.replace(/^https?:\/\//,'')) + '</a>'; },
    'sudo hire saba': function(){ return 'Permission granted. Type <b>contact</b>.'; }
  };
  $('termForm').addEventListener('submit', function(e){
    e.preventDefault();
    var c = inp.value.trim().toLowerCase(); inp.value = '';
    if(!c) return;
    print('<span style="color:#A0A5BE">$ ' + esc(c) + '</span>');
    if(c === 'clear'){ out.innerHTML = ''; return; }
    if(c === 'exit'){ closeTerm(); return; }
    if(c === 'matrix'){ rain(); print(reduce ? 'Reduced motion is on, so the rain stays off.' : 'For old times\' sake.'); return; }
    print(cmds[c] ? cmds[c]() : 'Command not found: ' + esc(c) + '. Try <b>help</b>.');
  });

  function rain(){
    if(reduce) return;
    var cv = $('rain'), ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight; cv.style.display = 'block';
    var size = 16, cols = Math.ceil(cv.width / size), drops = [];
    for(var i = 0; i < cols; i++) drops[i] = Math.random() * -40;
    var glyphs = '01<>{}[]/=+*SABA'.split(''), start = performance.now();
    (function frame(now){
      ctx.fillStyle = 'rgba(17,19,42,0.14)'; ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle = '#F4B71C'; ctx.font = size + 'px IBM Plex Mono, monospace';
      for(var i = 0; i < cols; i++){
        ctx.fillText(glyphs[(Math.random()*glyphs.length)|0], i*size, drops[i]*size);
        if(drops[i]*size > cv.height && Math.random() > .96) drops[i] = 0;
        drops[i] += 1;
      }
      if(now - start < 3200) requestAnimationFrame(frame);
      else { cv.style.display = 'none'; ctx.clearRect(0,0,cv.width,cv.height); }
    })(start);
  }
})();
