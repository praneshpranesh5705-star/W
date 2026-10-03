(() => {
  const FRAME_COUNT=144, FRAME_PATH=i=>`assets/frames/frame_${String(i+1).padStart(6,"0")}.jpg`;
  const hero=document.querySelector(".hero-scroll"),canvas=document.querySelector("#watchCanvas"),ctx=canvas.getContext("2d",{alpha:true});
  const progressBar=document.querySelector("#progressBar"),progressPercent=document.querySelector("#progressPercent"),caption=document.querySelector("#stageCaption");
  const loading=document.querySelector("#loading"),loadingText=document.querySelector("#loadingText"),hint=document.querySelector("#scrollHintText");
  const frames=new Array(FRAME_COUNT);let loaded=0,target=0,current=0,displayed=-1,raf=0,fallback=null;

  function resize(){const d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);if(displayed>=0)draw(displayed)}
  function draw(i){const img=frames[i]||fallback;if(!img||!img.naturalWidth)return;const w=canvas.clientWidth,h=canvas.clientHeight,s=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s;ctx.clearRect(0,0,w,h);ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);displayed=i}
  function load(i){return new Promise(resolve=>{const im=new Image();im.decoding="async";im.src=FRAME_PATH(i);im.onload=async()=>{try{await im.decode()}catch{}frames[i]=im;loaded++;loadingText.textContent=Math.round(loaded/FRAME_COUNT*100)+"%";resolve()};im.onerror=resolve})}
  async function preload(){let n=0;async function worker(){while(n<FRAME_COUNT){const i=n++;await load(i)}}await Promise.all(Array.from({length:8},worker));draw(0);loading.style.opacity="0";setTimeout(()=>loading.remove(),600)}
  function fallbackImage(){fallback=new Image();fallback.src="assets/watch-assembled.svg";fallback.onload=()=>{if(!loaded)draw(0)}}
  function progress(){const r=hero.getBoundingClientRect();return Math.max(0,Math.min(1,-r.top/Math.max(1,hero.offsetHeight-innerHeight)))}
  function frameFor(p){
    // Forward through the supplied dismantling sequence, then reverse it exactly.
    if(p<=.5)return Math.round((p/.5)*(FRAME_COUNT-1));
    return Math.round(((1-p)/.5)*(FRAME_COUNT-1));
  }
  function render(){
    current+=(target-current)*.085;const p=current,idx=frameFor(p);
    if(frames[idx]||fallback)draw(idx);
    // Add a subtle physical turn while the assembled object is entering the dismantling sequence.
    let ry=0,rx=0,scale=1;
    if(p<.18){const q=p/.18;ry=q*18;rx=Math.sin(q*Math.PI)*3;scale=1+Math.sin(q*Math.PI)*.025}
    else if(p>.82){const q=(p-.82)/.18;ry=(1-q)*18;rx=Math.sin(q*Math.PI)*3;scale=1+Math.sin(q*Math.PI)*.025}
    canvas.style.transform=`perspective(1400px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`;
    const pct=Math.round(p*100);progressBar.style.height=pct+"%";progressPercent.textContent=pct;
    if(p<.18)caption.innerHTML="<span>01</span> ROTATION";
    else if(p<.5)caption.innerHTML="<span>02</span> DISMANTLING";
    else if(p<.7)caption.innerHTML="<span>03</span> MECHANISM";
    else if(p<.82)caption.innerHTML="<span>04</span> REASSEMBLING";
    else caption.innerHTML="<span>05</span> ORIGINAL POSITION";
    hint.textContent=p<.98?"Scroll to dismantle":"Complete — scroll back to reassemble";
    if(Math.abs(target-current)>.0004)raf=requestAnimationFrame(render);else raf=0
  }
  function scroll(){target=progress();if(!raf)raf=requestAnimationFrame(render)}
  addEventListener("scroll",scroll,{passive:true});addEventListener("resize",resize);resize();fallbackImage();scroll();preload();
})();