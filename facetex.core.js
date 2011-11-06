function FaceTeXProcessElement(m){
  m.className += " processed";
  var src = m.innerText, html = m.innerHTML;
  function mepost(s){
    var q = m;
    while(!q.querySelector('textarea')) 
      q = q.parentNode;
    q = q.querySelector('textarea');
    q.focus();
    q.value += s;
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent("keydown" , false, false);
    q.dispatchEvent(evt);
  }
  if(/\\|\$\$|\{.+\}/i.test(src) && !/^''|[A-Z]:\\/.test(src)){
    var latex = src;
    var before = "";
    var after = "";
    
    var re = latex.match(/\$\$(.+)\$\$/);
    if(re){
      before = latex.substr(0, re.index);
      after = latex.substr(re[0].length + re.index);
      latex = re[1];
    }else if(/^\$\$/.test(latex)){
      latex = latex.substr(2);
    }else{
      var words = latex.match(/(^|[^a-z])[a-z]? ?[^a-zA-Z ']+/);
      if(words){
        before = latex.substr(0, words.index);
        latex = latex.substr(words.index);
      }
    }
    latex = latex.replace(/\\facetex/ig, '\\text{Face}\\TeX');
    
    function link(color){
      return "<a style='font-size:x-small;color:"+color+";float:right;text-decoration:none;font-weight:bold' target=_blank href='http://www.wolframalpha.com/input/?i="+encodeURIComponent(latex)+"'>&there4;</a>";
    }
    
    m.innerHTML += link("#007fff");
    var i = new Image();
    var div = document.createElement('div');
    div.appendChild(i);
    div.style.display = "inline";
    div.style.overflowX = 'auto';
    i.title = i.alt = latex;
    var realtex = /\\\[/.test(latex) ? latex : ('\\[{'+latex+'\\}]');
    i.src = "https://chart.googleapis.com/chart?cht=tx&chl="+encodeURIComponent(realtex);
    i.onclick = function(){
      mepost(src);
    }
    i.onload = function(){
      var t = m.innerText;
      if(parseInt(i.width) > 150){
        div.style.display = "block";
      }
      m.innerHTML = link("orange");
      if(before) m.appendChild(document.createTextNode(before+' '));
      m.appendChild(div);
      if(after) m.appendChild(document.createTextNode(' ' + after))
    }
    i.onerror = function(){
      m.innerHTML += " <span style='font-size:xx-small;color:red'>(TeXnichal difficulties)</span>";
    }
  }
}


function FaceTeXPost(element){
  var q = element;
  while(!q.querySelector('textarea')) 
    q = q.parentNode;
  q = q.querySelector('textarea');
  q.focus();
  q.value = (q.value.trim() + ' ' + element.title.trim()).trim();
  var evt = document.createEvent('HTMLEvents');
  evt.initEvent("keydown" , false, false);
  q.dispatchEvent(evt);
}

function FaceTeXProcess(text, matches){    
  function link(color, status){
    return "<a title='"+status+"' style='font-size:small;color:"+color+";float:right;text-decoration:none;font-weight:bold' target=_blank href='http://www.wolframalpha.com/input/?i="+encodeURIComponent(text)+"'>&there4;</a>";
  }
  var html = text.replace(/\$\$\{(.*?)\}\$\$/g, function(all, match){
    if(matches[match] == 'error'){ 
      return '<span style="color: red">'+match+'</span>';
    }else if(!matches[match] || matches[match] == match){
      matches[match] = match;
      return '<span style="color: #007fff">'+match+'</span>';
    }else{
      var display = (matches[match]).width > 150 ? 'block' : 'inline';
      return '<span style="display:'+display+'; overflow-x: auto; "><img style="vertical-align: middle" onclick="FaceTeXPost(this)" title="'+match+'" src="'+(matches[match]).src+'"></span>'
    }
  });
  console.log(text, JSON.stringify(matches));
  var complete = 0, error = 0, loading = 0;
  for(var t in matches){
    if(matches.hasOwnProperty(t)){
      if(matches[t] == t) loading++;
      else if(matches[t] == 'error') error++;
      else complete++;
    }
  }
  if(error != 0){
    html = link('red', 'error loading '+error+' components')  + html + " <span style='font-size:xx-small;color:red'>(TeXnichal difficulties)</span>";
  }else if(loading == 0){
    html = link(complete == 0 ? '#aaa' : 'orange', 'loaded '+complete+' components') + html;
  }else html = link('#007fff', 'loading '+loading+' components') + html;
  return html;
}


function FaceTeXImage(tex, callback){
  var i = new Image();
  //TODO: here goes the pre-TeX text transforms
  var src = "https://chart.googleapis.com/chart?cht=tx&chl="+encodeURIComponent(tex);
  i.onload = function(){
  setTimeout(function(){
    callback(tex, {
      width: parseInt(i.width),
      src: src
    });
    },5000 * Math.random());
  }
  i.onerror = function(){
    callback(tex, 'error');
  }
  i.src = src;
}


function FaceTeXElement(m){
  m.className += " processed";
  var src = m.innerText, html = m.innerHTML;

  if((/\\|\$\$|\{.+\}/i.test(src) || /(^| )[a-z][\^\_][a-z0-9]($| )/.test(src)) && !/^''|[A-Z]:\\/.test(src)){
    var latex = src;
    //TODO: here goes pre-search text transforms
    var matches = {};
    m.innerHTML = FaceTeXProcess(latex, matches);
    for(var t in matches){
      if(matches.hasOwnProperty(t) && matches[t] == t){
        FaceTeXImage(t, function(tex, result){
          matches[tex] = result;
          m.innerHTML = FaceTeXProcess(latex, matches);
        })
      }
    }
  }
}


function FaceTeXFindElements(){
  var msg = document.querySelectorAll('.fbChatMessage:not(.processed),.MessagingMessage .uiListItem p:not(.processed)');
  for(var i = 0; i < msg.length; i++) FaceTeXElement(msg[i]);
  if(/textarea/i.test(document.activeElement.tagName)){
    var textinput = document.querySelectorAll('.fbDock textarea');
    for(var i = 0; i < textinput.length; i++){
      if(textinput[i] == document.activeElement && /facetex/i.test(textinput[i].value) && !/user.js|\\facetex/i.test(textinput[i].value)){
        textinput[i].value += ' ' + "http://metaception.com/facetex.user.js ";
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent("keydown" , false, false);
        textinput[i].dispatchEvent(evt);
      }
    }
  }
}
setInterval(FaceTeXFindElements, 762);
