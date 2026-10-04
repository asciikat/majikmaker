'use strict';
let installPrompt=null;
const installButton=document.getElementById('installButton');
const installDialog=document.getElementById('installDialog');
const standalone=window.matchMedia('(display-mode: standalone)');
function updateInstallButton(){installButton.hidden=standalone.matches||navigator.standalone===true;}
updateInstallButton();standalone.addEventListener?.('change',updateInstallButton);
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;updateInstallButton();});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;showToast('Majik Maker is installed.');});
installButton.addEventListener('click',async()=>{
 if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch(e){showInstructions();}return;}
 showInstructions();
});
function showInstructions(){
 const ua=navigator.userAgent;
 let instructions;
 if(location.protocol==='file:'){instructions='Open Majik Maker from a secure website or the local development server to install it. Installation and offline setup are unavailable when opening the HTML file directly.';}
 else if(/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)){instructions='On iPhone or iPad, open this page in Safari. Tap the Share button, choose “Add to Home Screen,” then tap “Add.”';}
 else if(/Android/.test(ua)){instructions='In Chrome, open the browser menu and choose “Install app” or “Add to Home screen.” If the option is not available yet, keep this page open for a moment and try again.';}
 else if(/Safari/.test(ua)&&!/Chrome|Chromium|Edg/.test(ua)){instructions='In Safari on macOS Sonoma or later, choose File → Add to Dock. You can also open this page in Chrome or Edge and choose “Install app” from the browser menu.';}
 else{instructions='In Chrome or Edge, select the install icon beside the address bar, or open the browser menu and choose “Install Majik Maker.” Installation is available when the app is opened from a secure website.';}
 document.getElementById('installInstructions').textContent=instructions;
 if(!installDialog.open)installDialog.showModal();
}
document.getElementById('closeInstallDialog').addEventListener('click',()=>installDialog.close());
document.getElementById('installDone').addEventListener('click',()=>installDialog.close());
installDialog.addEventListener('click',e=>{if(e.target===installDialog){const r=installDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)installDialog.close();}});
if('serviceWorker' in navigator&&window.isSecureContext&&location.protocol!=='file:'){
 window.addEventListener('load',()=>{
  const firstVisit=!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>{if(firstVisit)navigator.serviceWorker.ready.then(()=>showToast('Ready for offline use.'));}).catch(()=>showToast('Offline setup couldn’t finish. You can still create symbols while online.'));
 });
}
