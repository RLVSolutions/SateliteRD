var SAT_BRIDGE=(function(){
 var frame=null,destino=null,ready=false,waiting={},queue=[],seq=0,urlActual='',arranque=null;
 var LIMITE_INICIO=25000,LIMITE_LLAMADA=85000;
 function origenValido(o){o=String(o||'');return /^https:\/\/[a-z0-9-]+\.googleusercontent\.com$/i.test(o)||o==='https://script.google.com';}
 function fallar(id,msg){var x=waiting[id];if(!x)return;clearTimeout(x.timer);delete waiting[id];x.err(msg);}
 function enviar(req){try{destino.postMessage(req,'*');}catch(e){fallar(req.id,String(e&&e.message||e));}}
 function reiniciar(){
  clearTimeout(arranque);
  if(frame&&frame.parentNode)frame.parentNode.removeChild(frame);
  frame=null;destino=null;ready=false;urlActual='';
 }
 function onMessage(ev){
  var m=ev.data;if(!m||m.satBridge!==1||!origenValido(ev.origin))return;
  if(m.type==='ready'){if(!frame)return;destino=ev.source;ready=true;clearTimeout(arranque);while(queue.length)enviar(queue.shift());return;}
  if(m.type==='result'){var x=waiting[m.id];if(!x)return;clearTimeout(x.timer);delete waiting[m.id];if(m.error)x.err(m.error);else x.ok(m.resultado);}
 }
 if(window.addEventListener)window.addEventListener('message',onMessage,false);
 function iniciar(url){
  if(frame&&urlActual===url)return;
  reiniciar();urlActual=url;
  frame=document.createElement('iframe');
  frame.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px';
  frame.setAttribute('aria-hidden','true');
  frame.src=url+(url.indexOf('?')<0?'?':'&')+'bridge=1&t='+new Date().getTime();
  (document.body||document.documentElement).appendChild(frame);
  arranque=setTimeout(function(){
   if(ready)return;
   var ids=[],k,i;for(k in waiting)ids.push(k);
   queue=[];
   for(i=0;i<ids.length;i++)fallar(ids[i],'Puente no inició: revise archivo Bridge, SAT_ALLOWED_ORIGIN y acceso «Cualquier usuario»');
   reiniciar();
  },LIMITE_INICIO);
 }
 function llamar(url,fn,arg,ok,err){
  url=String(url||'').replace(/\s/g,'');
  if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(\?.*)?$/.test(url)){err('URL Apps Script inválida');return;}
  iniciar(url);
  var id='r'+(++seq),req={satBridge:1,type:'call',id:id,fn:fn,arg:arg||{}};
  waiting[id]={ok:ok,err:err,timer:setTimeout(function(){fallar(id,'Servidor no respondió a tiempo');},LIMITE_INICIO+LIMITE_LLAMADA)};
  if(ready)enviar(req);else queue.push(req);
 }
 return {llamar:llamar,reiniciar:reiniciar};
})();


