(() => {
const canvas=document.getElementById("watch"),ctx=canvas.getContext("2d");
const hero=document.querySelector(".hero-scroll"),bar=document.getElementById("bar"),pct=document.getElementById("pct");
const stageNo=document.getElementById("stageNo"),stageText=document.getElementById("stageText"),hint=document.getElementById("hint");
let dpr=1,w=0,h=0,target=0,progress=0,raf=0;

function resize(){dpr=Math.min(devicePixelRatio||1,2);const r=canvas.getBoundingClientRect();w=r.width;h=r.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function ease(v){return v*v*(3-2*v)}
function scrollProgress(){const r=hero.getBoundingClientRect();return clamp(-r.top/Math.max(1,hero.offsetHeight-innerHeight))}
function polar(cx,cy,r,a){return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]}
function gear(cx,cy,r,teeth,rot,alpha=1){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.globalAlpha=alpha;
  ctx.beginPath();
  for(let i=0;i<teeth;i++){const a=i*Math.PI*2/teeth;const r1=r*.84,r2=r*1.03;
    for(const [rr,off] of [[r1,0],[r2,.18],[r2,.55],[r1,.72]]){const p=polar(0,0,rr,a+off*Math.PI*2/teeth);ctx.lineTo(p[0],p[1])}}
  ctx.closePath();ctx.strokeStyle="#c8a16b";ctx.lineWidth=Math.max(1,r*.018);ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,r*.23,0,Math.PI*2);ctx.strokeStyle="#777c84";ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore()
}
function roundedRect(x,y,ww,hh,rr){ctx.beginPath();ctx.roundRect(x,y,ww,hh,rr)}
function drawWatch(p){
  ctx.clearRect(0,0,w,h);
  const cx=w*.60, cy=h*.51, base=Math.min(w*.31,h*.28);
  // cinematic camera turn: face -> slight side -> face
  const turn=ease(clamp(p/.16))*0.9 + ease(clamp((p-.84)/.16))*-.9;
  const scale=1+Math.sin(Math.PI*clamp((p-.04)/.92))*0.025;
  ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);ctx.rotate(turn*.035);
  const spread=ease(clamp((p-.18)/.55));
  const re=ease(clamp((p-.73)/.27)); const explode=spread*(1-re);
  const face=base;
  const metal="#c6c9c8", dark="#111418", glass="#162434", gold="#c8a16b";
  // exploded offsets
  const caseY=-explode*base*1.65, bezelY=-explode*base*.78, dialY=-explode*base*.22, handsY=explode*base*.48, mechY=explode*base*1.15, crownX=explode*base*1.45;
  function layer(y,alpha,fn){ctx.save();ctx.translate(0,y);ctx.globalAlpha=alpha;fn();ctx.restore()}
  // rear plate
  layer(mechY,1,()=>{ctx.beginPath();ctx.arc(0,0,face*.72,0,Math.PI*2);ctx.fillStyle="#0b0e11";ctx.fill();ctx.strokeStyle="#6d737b";ctx.lineWidth=2;ctx.stroke();
    gear(-face*.25,-face*.05,face*.22,18,p*7,1);gear(face*.27,face*.13,face*.18,16,-p*9,1);gear(0,face*.28,face*.13,14,p*11,1);
    ctx.strokeStyle="#c8a16b88";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,face*.58,-.8,.8);ctx.stroke();
  });
  // case
  layer(caseY,1,()=>{ctx.beginPath();ctx.arc(0,0,face*.98,0,Math.PI*2);ctx.fillStyle="#07090b";ctx.fill();ctx.strokeStyle=metal;ctx.lineWidth=face*.065;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,face*.92,0,Math.PI*2);ctx.strokeStyle="#ffffff35";ctx.lineWidth=2;ctx.stroke();
  });
  // lugs
  layer(caseY,1,()=>{ctx.fillStyle="#aeb2b2";roundedRect(-face*.52,-face*1.08,face*1.04,face*.22,face*.08);ctx.fill();roundedRect(-face*.52,face*.86,face*1.04,face*.22,face*.08);ctx.fill()});
  // bezel
  layer(bezelY,1,()=>{ctx.beginPath();ctx.arc(0,0,face*.84,0,Math.PI*2);ctx.fillStyle="#b8bbb9";ctx.fill();ctx.beginPath();ctx.arc(0,0,face*.76,0,Math.PI*2);ctx.fillStyle="#080a0d";ctx.fill()});
  // dial
  layer(dialY,1,()=>{ctx.beginPath();ctx.arc(0,0,face*.69,0,Math.PI*2);ctx.fillStyle=glass;ctx.fill();ctx.strokeStyle="#d8d6cf";ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2;const r1=face*.59,r2=i%3===0?face*.48:face*.53;const A=polar(0,0,r1,a),B=polar(0,0,r2,a);ctx.strokeStyle=i%3===0?gold:"#bfc3c2";ctx.lineWidth=i%3===0?3:1;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke()}
    ctx.beginPath();ctx.arc(0,0,face*.08,0,Math.PI*2);ctx.fillStyle=gold;ctx.fill()
  });
  // hands
  layer(handsY,1,()=>{const t=Date.now()/1000;const ha=t*.45,ma=t*.055;
    ctx.lineCap="round";ctx.strokeStyle="#f0eee7";ctx.lineWidth=face*.035;ctx.beginPath();ctx.moveTo(0,0);let q=polar(0,0,face*.42,ha);ctx.lineTo(q[0],q[1]);ctx.stroke();
    ctx.strokeStyle=gold;ctx.lineWidth=face*.018;ctx.beginPath();ctx.moveTo(0,0);q=polar(0,0,face*.54,ma);ctx.lineTo(q[0],q[1]);ctx.stroke();
  });
  // crown and side details
  ctx.save();ctx.translate(face*.99+crownX,0);ctx.fillStyle="#bfc2c1";roundedRect(0,-face*.13,face*.22,face*.26,face*.06);ctx.fill();ctx.strokeStyle="#73787e";ctx.stroke();ctx.restore();
  // exploded connector lines
  if(explode>.02){ctx.globalAlpha=.3;ctx.setLineDash([4,7]);ctx.strokeStyle=gold;ctx.lineWidth=1;
    [caseY,bezelY,dialY,handsY,mechY].forEach(y=>{ctx.beginPath();ctx.moveTo(-face*1.05,y);ctx.lineTo(face*1.05,y);ctx.stroke()});ctx.setLineDash([])
  }
  ctx.restore();
}
function render(){
  progress+=(target-progress)*.085;
  drawWatch(progress);
  const n=Math.round(progress*100);bar.style.height=n+"%";pct.textContent=n+"%";
  if(progress<.18){stageNo.textContent="01";stageText.textContent="THE TIMEPIECE";hint.textContent="SCROLL TO EXPLORE"}
  else if(progress<.46){stageNo.textContent="02";stageText.textContent="ROTATION + OPENING"}
  else if(progress<.73){stageNo.textContent="03";stageText.textContent="MECHANICAL HEART"}
  else if(progress<.94){stageNo.textContent="04";stageText.textContent="REASSEMBLY"}
  else{stageNo.textContent="05";stageText.textContent="PERFECTLY CLOSED";hint.textContent="SCROLL BACK TO REASSEMBLE"}
  if(Math.abs(target-progress)>.0003||Math.abs(Math.sin(Date.now()/600))>.01)raf=requestAnimationFrame(render);else raf=0
}
function onScroll(){target=scrollProgress();if(!raf)raf=requestAnimationFrame(render)}
addEventListener("resize",resize);addEventListener("scroll",onScroll,{passive:true});resize();onScroll();render();
})();