function FaceTeXProcessElement(m){
  m.className += " processed";
  var src = m.innerText, html = m.innerHTML;
  function mepost(){
    var q = m;
    while(!q.querySelector('textarea')) 
      q = q.parentNode;
    q = q.querySelector('textarea');
    q.focus();
    return q
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
      var words = latex.match(/^[a-zA-Z ']+/);
      if(words){
        before = words[0];
        latex = latex.substr(words[0].length);
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
    var realtex = /\\\[/.test(latex) ? latex : ('\\['+latex+'\\]');
    i.src = "https://chart.googleapis.com/chart?cht=tx&chl="+encodeURIComponent(realtex);
    i.onclick = function(){
      mepost().value += src;
    }
    i.onload = function(){
      var t = m.innerText;
      if(parseInt(i.width) > 150){
        div.style.display = "block";
      }
      m.innerHTML = link("orange");
      m.appendChild(document.createTextNode(before))
      m.appendChild(div);
      m.appendChild(document.createTextNode(after))
    }
    i.onerror = function(){
      m.innerHTML += " <span style='font-size:xx-small;color:red'>(TeXnichal difficulties)</span>";
    }
  }/*
  if(/facetex/i.test(src)){
    var q = m;
    while(!q.querySelector('.profileLink')) 
      q = q.parentNode;
    if(document.querySelector('#blueBar').innerHTML.indexOf(q.querySelector('.profileLink').href) != -1){
      mepost().value = "http://metaception.com/facetex.user.js";
    }
  }*/
}

function FaceTeXFindElements(){
  var msg = document.querySelectorAll('.fbChatMessage:not(.processed),.MessagingMessage .uiListItem p:not(.processed)');
  for(var i = 0; i < msg.length; i++) FaceTeXProcessElement(msg[i]);
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
