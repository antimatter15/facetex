function FaceTeXProcessElement(m){
  m.className += " processed";
  if(/\\|\$\$/i.test(m.innerText)){
    var i = new Image();
    var src = m.innerText, html = m.innerHTML;
    i.title = i.alt = src;
    m.innerHTML += "<a style='font-size:x-small;color:#007fff;float:right;text-decoration:none;font-weight:bold' href='http://www.wolframalpha.com/input/?i="+encodeURIComponent(src)+"'>&there4;</a>";
    i.onclick = function(){
      var q = m;
      while(!q.querySelector('textarea')) 
        q = q.parentNode;
      q = q.querySelector('textarea');
      q.focus();
      q.value += src;
    }
    i.src = "https://chart.googleapis.com/chart?cht=tx&chl="+encodeURIComponent(src);
    i.onload = function(){
      var t = m.innerText;
      m.innerHTML = "<a style='font-size:x-small;color:orange;float:right;text-decoration:none;font-weight:bold' href='http://www.wolframalpha.com/input/?i="+encodeURIComponent(src)+"'>&there4;</a>";;
      m.appendChild(i);
    }
    i.onerror = function(){
      m.innerHTML += " <span style='font-size:xx-small;color:red'>(TeXnichal difficulties)</span>";
    }
  }
}

function FaceTeXFindElements(){
  var msg = document.querySelectorAll('.fbChatMessage:not(.processed),.MessagingMessage uiListItem:not(.processed)');
  for(var i = 0; i < msg.length; i++) FaceTeXProcessElement(msg[i]);
}
setInterval(FaceTeXFindElements, 762);
