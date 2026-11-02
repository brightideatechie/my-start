/** Small, dependency-free widget registry. Never inject user data as HTML. */
const registry = new Map();
export function registerWidget(type, definition) {
  if(!/^[a-z][a-z0-9_-]*$/.test(type) || registry.has(type)) throw new Error("Invalid or duplicate widget type");
  if(typeof definition?.render !== "function") throw new TypeError("Widget requires render()");
  registry.set(type,Object.freeze({...definition}));
}
export function listWidgets(){return [...registry.keys()];}
export function mountWidget(type, container, config={}) {
  const definition=registry.get(type);
  if(!definition) throw new Error("Unknown widget: "+type);
  if(!(container instanceof Element)) throw new TypeError("Invalid widget container");
  const cleanup=definition.render(container,structuredClone(config));
  return typeof cleanup==="function" ? cleanup : ()=>{};
}
registerWidget("clock",{render(container){
  const time=document.createElement("time");
  const tick=()=>{const now=new Date();time.dateTime=now.toISOString();time.textContent=now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});};
  container.replaceChildren(time);tick();const interval=setInterval(tick,1000);return ()=>clearInterval(interval);
}});
registerWidget("notes",{render(container,config){
  const label=document.createElement("label");label.textContent=config.label || "Notes";
  const area=document.createElement("textarea");area.setAttribute("aria-label",label.textContent);area.value=String(config.value||"");
  label.appendChild(area);container.replaceChildren(label);return ()=>{};
}});
registerWidget("links",{render(container,config){
  const list=document.createElement("ul");
  for(const link of config.links||[]){
    if(typeof link?.url!=="string" || typeof link?.name!=="string") continue;
    let url;try{url=new URL(link.url);}catch{continue;}
    if(!["http:","https:"].includes(url.protocol) || url.username || url.password)continue;
    const li=document.createElement("li"),a=document.createElement("a");a.href=url.href;a.textContent=link.name;li.appendChild(a);list.appendChild(li);
  }
  container.replaceChildren(list);return ()=>{};
}});
