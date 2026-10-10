/* RDM Satélite — transporte iframe Apps Script (ES5 / SUNMI Android 5.1) */
var SAT_BRIDGE=(function(){
 var frame=null,ready=false,waiting={},queue=[],seq=0,booted=false;
 var LIMITE=15000;
 function url(){return String((window.SAT_CONFIG&&SAT_CONFIG.API_URL)||'').replace(/\s/g,'');}
 function configurado(){return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(url());}
 function enviar(req){try{frame.contentWindow.postMessage(req,'*');}catch(e){var x=waiting[req.id];if(x){clearTimeout(x.timer);delete waiting[req.id];x.err(String(e));}}}
 function onMessage(ev){
  if(!frame||ev.source!==frame.contentWindow)return;
  var m=ev.data;if(!m||m.satBridge!==1)return;
  if(m.type==='ready'){ready=true;while(queue.length)enviar(queue.shift());return;}
  if(m.type==='result'){var x=waiting[m.id];if(!x)return;clearTimeout(x.timer);delete waiting[m.id];if(m.error)x.err(m.error);else x.ok(m.resultado);}
 }
 function iniciar(){if(booted||!configurado())return;booted=true;
  if(window.addEventListener)window.addEventListener('message',onMessage,false);
  frame=document.createElement('iframe');frame.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px';
  frame.setAttribute('aria-hidden','true');frame.src=url()+(url().indexOf('?')<0?'?':'&')+'bridge=1';
  (document.body||document.documentElement).appendChild(frame);
 }
 function llamar(fn,arg,ok,err){iniciar();if(!frame){err('Configure API_URL en config.js');return;}
  var id='r'+(++seq),req={satBridge:1,type:'call',id:id,fn:fn,arg:arg||{}};
  waiting[id]={ok:ok,err:err,timer:setTimeout(function(){var x=waiting[id];if(!x)return;delete waiting[id];err(ready?'Servidor no respondió en 15 s':'Puente no inició: compruebe Bridge.html, SAT_ALLOWED_ORIGIN y despliegue Apps Script');},LIMITE)};if(ready)enviar(req);else queue.push(req);
 }
 return {configurado:configurado,llamar:llamar};
})();

