const defaultState = {
  habits: [
    {id:1,name:"Drink 8 glasses of water",icon:"💧",done:true,xp:20},
    {id:2,name:"Study for 2 hours",icon:"📚",done:true,xp:30},
    {id:3,name:"Move your body",icon:"🏃‍♀️",done:true,xp:25},
    {id:4,name:"Read 10 pages",icon:"📖",done:false,xp:15},
    {id:5,name:"Journal for 5 minutes",icon:"📝",done:false,xp:15},
    {id:6,name:"Sleep before 12 AM",icon:"🌙",done:false,xp:20}
  ],
  goals:[
    {id:1,name:"Become more consistent",icon:"🔥",progress:70},
    {id:2,name:"Finish my next big project",icon:"💻",progress:45}
  ],
  mood:null, streak:5, xp:120
};
let state = JSON.parse(localStorage.getItem("glowupState") || "null") || structuredClone(defaultState);
let modalMode = null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function save(){localStorage.setItem("glowupState",JSON.stringify(state));}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function percent(){return Math.round(state.habits.filter(h=>h.done).length/state.habits.length*100)}
function render(){
  const done=state.habits.filter(h=>h.done).length;
  $("#heroProgress").textContent=percent()+"%";
  $("#doneStat").textContent=`${done}/${state.habits.length}`;
  $("#xpStat").textContent=state.xp;
  $("#streakStat").textContent=state.streak;
  $("#goalStat").textContent=state.goals.length;
  renderHabitPreview(); renderHabits(); renderGoals(); renderAchievements();
  if(state.mood){ $("#currentMood").textContent=state.mood; $("#moodEmoji").textContent={Great:"🤩",Good:"😊",Okay:"😐",Low:"😔",Rough:"🥺"}[state.mood]; $$(".mood-card").forEach(x=>x.classList.toggle("selected",x.dataset.mood===state.mood));}
}
function habitRow(h){
 return `<div class="habit-row"><button class="check ${h.done?"done":""}" data-habit="${h.id}">${h.done?"✓":""}</button><span class="name">${h.icon} ${h.name}</span><span class="xp">+${h.xp} XP</span></div>`;
}
function renderHabitPreview(){ $("#habitPreview").innerHTML=state.habits.slice(0,6).map(habitRow).join(""); bindHabitButtons(); }
function renderHabits(){
 $("#habitFull").innerHTML=state.habits.map(h=>`<div class="card">
   <div class="card-head"><span class="card-icon">${h.icon}</span><span class="xp">+${h.xp} XP</span></div>
   <h3>${h.name}</h3><p>${h.done?"Completed today ✨":"Keep going — you've got this."}</p>
   <div class="mini-progress"><i style="width:${h.done?100:0}%"></i></div>
   <div class="card-foot"><span>${h.done?"Done":"Not done yet"}</span><button class="text-btn toggle-card" data-habit="${h.id}">${h.done?"Undo":"Complete"}</button></div>
 </div>`).join("");
 bindHabitButtons();
}
function bindHabitButtons(){
 $$("[data-habit]").forEach(btn=>btn.onclick=()=>{
   const h=state.habits.find(x=>x.id==btn.dataset.habit); const was=h.done; h.done=!h.done;
   state.xp=Math.max(0,state.xp+(h.done? h.xp:-h.xp)); save(); render(); toast(h.done?`+${h.xp} XP — proud of you ✨`:"Habit unchecked");
 });
}
function renderGoals(){
 $("#goalList").innerHTML=state.goals.map(g=>`<div class="goal-item"><div class="goal-top"><div><span class="card-icon">${g.icon}</span><h3>${g.name}</h3></div><span class="goal-percent">${g.progress}%</span></div>
 <div class="goal-progress"><i style="width:${g.progress}%"></i></div>
 <div class="goal-actions"><button data-goal="${g.id}" data-step="-10">−10%</button><button data-goal="${g.id}" data-step="10">+10%</button></div></div>`).join("");
 $$("[data-goal]").forEach(b=>b.onclick=()=>{const g=state.goals.find(x=>x.id==b.dataset.goal);g.progress=Math.max(0,Math.min(100,g.progress+Number(b.dataset.step)));save();renderGoals();toast(g.progress===100?"Goal completed! 🏆":"Goal updated ✨")});
}
function renderAchievements(){
 const done=state.habits.filter(h=>h.done).length;
 const items=[
  ["🌱","First step","Complete your first habit",done>=1],
  ["🔥","Consistency","Complete 3 habits today",done>=3],
  ["⭐","XP Collector","Reach 200 XP",state.xp>=200],
  ["🎯","Goal Getter","Complete a goal",state.goals.some(g=>g.progress===100)],
  ["👑","GlowUp Master","Reach 500 XP",state.xp>=500],
  ["💎","Unstoppable","Keep a 7 day streak",state.streak>=7]
 ];
 $("#achievementList").innerHTML=items.map(a=>`<div class="achievement ${a[3]?"":"locked"}"><span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p></div>`).join("");
}
function openModal(mode){
 modalMode=mode; $("#modal").classList.remove("hidden"); $("#modalTitle").textContent=mode==="habit"?"Add a new habit":"Add a new goal"; $("#modalEyebrow").textContent=mode==="habit"?"NEW HABIT":"NEW GOAL"; $("#modalInput").value="";$("#modalInput").focus();
}
function closeModal(){$("#modal").classList.add("hidden")}
$("#addHabitBtn").onclick=()=>openModal("habit");$("#addGoalBtn").onclick=()=>openModal("goal");$("#closeModal").onclick=closeModal;
$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#modalSave").onclick=()=>{
 const value=$("#modalInput").value.trim();if(!value)return;
 if(modalMode==="habit") state.habits.push({id:Date.now(),name:value,icon:"✨",done:false,xp:15});
 else state.goals.push({id:Date.now(),name:value,icon:"🎯",progress:0});
 save();render();closeModal();toast("Added to your GlowUp ✨");
};
$$(".nav-item").forEach(b=>b.onclick=()=>showSection(b.dataset.section));
$$("[data-section-link]").forEach(b=>b.onclick=()=>showSection(b.dataset.sectionLink));
function showSection(id){$$(".section").forEach(s=>s.classList.toggle("active",s.id===id));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===id));$("#pageTitle").innerHTML=id==="dashboard"?`Good evening, <span>Sara</span> ✨`:id[0].toUpperCase()+id.slice(1);window.scrollTo({top:0,behavior:"smooth"})}
const quotes=["You don't need to be perfect. You just need to keep going.","Future you is going to thank you for starting today.","Tiny progress is still progress.","Your only competition is who you were yesterday.","Do something today your future self will be proud of.","Consistency will take you places motivation can't."];
$("#newQuote").onclick=()=>$("#quoteText").textContent=quotes[Math.floor(Math.random()*quotes.length)];
$$(".mood-card").forEach(b=>b.onclick=()=>{state.mood=b.dataset.mood;save();render();toast(`Mood saved: ${b.dataset.mood} 💗`)});
$("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("glowupDark",document.body.classList.contains("dark"));};
if(localStorage.getItem("glowupDark")==="true")document.body.classList.add("dark");
$("#resetBtn").onclick=()=>{if(confirm("Reset your GlowUp demo?")){state=structuredClone(defaultState);save();render();toast("Demo reset ✨")}};
const d=new Date();$("#todayLabel").textContent=d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
render();
