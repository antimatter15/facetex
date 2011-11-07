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
  var html = text.replace(/(\$\$|\#\#)\{(.*?)\}(\$\$|\#\#)/g, function(all, z, match){
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
  //console.log(text, JSON.stringify(matches));
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
  var latex = tex;
  //TODO: here goes the pre-TeX text transforms

  latex = latex.replace(/\\facetex/i, '\\text{Face}\\TeX_{3.1}');
  if(/^\\includegraphics{(.*)}$/.test(latex)){
    return callback(tex, {width: 200, src: /^\\includegraphics{(.*)}$/.exec(latex)[1]})
  }

  ////////////////////////
  var src = "https://chart.googleapis.com/chart?cht=tx&chl="+encodeURIComponent(latex);
  i.onload = function(){
    callback(tex, {
      width: parseInt(i.width),
      src: src
    });
  }
  i.onerror = function(){
    callback(tex, 'error');
  }
  i.src = src;
}


function FaceTeXElement(m){
  m.className += " processed";
  var src = m.innerText, html = m.innerHTML;
  //matches things like v_0, a_0, a^2, b^2, 5^7, v_{initial}
  var var_re = /(^| )([0-9][\^\_][0-9]|[a-z][\^\_]\{[a-z0-9\}\^\_]+|[a-z][\^\_][a-z0-9][\^\_]?[a-z0-9]?)($| )/g;
  
  if((/\\|\$\$|\{.+\}/i.test(src) || var_re.test(src)) && !/^''|[A-Z]:\\/.test(src) && !/^\\\\/.test(src)){
    var latex = src;
    //TODO: here goes pre-search text transforms
    if(/\$\$\{(.*)\}\$\$/.test(latex)){
      //run unmodified
    }else if(/^\$\$/.test(latex)){
      latex = '##{$$' + latex.replace(/\$\$/g, '') + '$$}##'
    }else{
      var strange = latex.split(/[^a-z0-9 '\?\!\.]/i).length - 1;
      if(strange < 3){
        latex = latex.replace(var_re, '$1##{$2}##$3');
        latex = latex.replace(/(\\[a-z]+([^a-z ][a-z]*)*(\{.*?\})*( [a-z0-9]{1,3})?)/ig, '##{$1}##')
        
      }else{
        latex = latex.replace(/((^|[^a-z])[a-z]? ?[^a-zA-Z ']+.*?)( [a-z '\?\!\.]{3,})?$/i, '$2##{$1}##$3')
      }
    }
    
    
    //console.log(latex);
    //////////////////////////////
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

setInterval(FaceTeXFindElements, 3141);

var FaceTeXLastModified = 0;
document.body.addEventListener('DOMNodeInserted', function(e){
  var now = +new Date;
  if(now - FaceTeXLastModified > 271){
    FaceTeXFindElements();
  }
}, true);

