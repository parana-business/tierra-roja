const header=document.querySelector("#site-header");
const menuToggle=document.querySelector(".menu-toggle");
const navLinks=document.querySelectorAll(".main-nav a");
const dialog=document.querySelector("#project-dialog");
const closeDialog=document.querySelector(".dialog-close");

const projectData={
  umbral:{title:"Casa Umbral",category:"Vivienda unifamiliar · Villa Sarita, Posadas",description:"Una secuencia de planos y patios que regula la luz del oeste. La casa se abre hacia el jardín sin perder intimidad, prolongando las áreas de encuentro bajo una galería profunda.",image:"assets/images/casa-umbral.jpg",alt:"Casa Umbral, vivienda contemporánea abierta al jardín",facts:[["Tipología","Vivienda"],["Superficie","240 m²"],["Estado","Proyecto conceptual"],["Materialidad","Hormigón · piedra · madera"]]},
  yvyra:{title:"Refugio Yvyrá",category:"Hospitalidad · Ruta Costera, Misiones",description:"Pequeñas piezas de descanso se apoyan con delicadeza sobre el terreno. La madera, la piedra y las cubiertas livianas construyen refugios silenciosos entre la vegetación nativa.",image:"assets/images/refugio-yvyra.jpg",alt:"Refugio Yvyrá entre vegetación tropical",facts:[["Tipología","Hospitalidad"],["Unidades","6 refugios"],["Estado","Proyecto conceptual"],["Materialidad","Madera · piedra · vidrio"]]},
  patio:{title:"Patio Rojo",category:"Reforma residencial · Posadas",description:"La intervención recupera el corazón abierto de una vivienda existente. Nuevos umbrales, sombra y vegetación convierten al patio en el verdadero espacio articulador de la casa.",image:"assets/images/patio-rojo.jpg",alt:"Patio Rojo, reforma contemporánea articulada alrededor del patio",facts:[["Tipología","Reforma"],["Superficie","165 m²"],["Estado","Proyecto conceptual"],["Materialidad","Ladrillo · piedra · revoque"]]}
};

function setHeaderState(){header.classList.toggle("is-scrolled",window.scrollY>24)}
setHeaderState();window.addEventListener("scroll",setHeaderState,{passive:true});

menuToggle.addEventListener("click",()=>{const open=document.body.classList.toggle("menu-open");menuToggle.setAttribute("aria-expanded",String(open));menuToggle.querySelector(".menu-toggle__label").textContent=open?"Cerrar":"Menú"});
navLinks.forEach(link=>link.addEventListener("click",()=>{document.body.classList.remove("menu-open");menuToggle.setAttribute("aria-expanded","false");menuToggle.querySelector(".menu-toggle__label").textContent="Menú"}));

const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:"0px 0px -6%"});
document.querySelectorAll(".reveal, .reveal-media").forEach((element,index)=>{element.style.transitionDelay=`${Math.min(index%3*70,140)}ms`;observer.observe(element)});

function openProject(key){
  const project=projectData[key];if(!project)return;
  document.querySelector("#dialog-title").textContent=project.title;
  document.querySelector("#dialog-category").textContent=project.category;
  document.querySelector("#dialog-description").textContent=project.description;
  const image=document.querySelector("#dialog-image");image.src=project.image;image.alt=project.alt;
  const facts=document.querySelector("#dialog-facts");facts.replaceChildren();
  project.facts.forEach(([label,value])=>{const group=document.createElement("div"),term=document.createElement("dt"),detail=document.createElement("dd");term.textContent=label;detail.textContent=value;group.append(term,detail);facts.append(group)});
  dialog.showModal();document.body.classList.add("dialog-open");
}
document.querySelectorAll("[data-project]").forEach(button=>button.addEventListener("click",()=>openProject(button.dataset.project)));
function closeProject(){dialog.close();document.body.classList.remove("dialog-open")}
closeDialog.addEventListener("click",closeProject);
dialog.addEventListener("click",event=>{const bounds=dialog.getBoundingClientRect();const outside=event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom;if(outside)closeProject()});
dialog.addEventListener("close",()=>document.body.classList.remove("dialog-open"));
document.querySelector("#year").textContent=new Date().getFullYear();

/* Carrusel de proyectos */
(function(){
  const carousel=document.querySelector("[data-carousel]");if(!carousel)return;
  const track=carousel.querySelector(".project-list");
  const slides=[...track.children];
  const dots=[...carousel.querySelectorAll(".carousel__dot")];
  const DELAY=6500;
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index=0,timer=null,paused=false,startX=0,deltaX=0,dragging=false,moved=false;
  carousel.style.setProperty("--carousel-delay",DELAY+"ms");
  if(reduce)carousel.classList.add("is-static");

  function schedule(){clearTimeout(timer);if(reduce||paused)return;timer=setTimeout(()=>go(index+1),DELAY)}
  function go(n){
    index=(n+slides.length)%slides.length;
    track.style.transform=`translateX(${-100*index}%)`;
    slides.forEach((slide,i)=>{const active=i===index;slide.classList.toggle("is-active",active);slide.setAttribute("aria-hidden",String(!active));slide.inert=!active});
    dots.forEach(dot=>dot.classList.remove("is-active"));void track.offsetWidth;
    dots.forEach((dot,i)=>{dot.classList.toggle("is-active",i===index);dot.setAttribute("aria-current",i===index?"true":"false")});
    schedule();
  }
  function setPaused(value){if(paused===value)return;paused=value;carousel.classList.toggle("is-paused",value);if(value)clearTimeout(timer);else go(index)}

  carousel.querySelector(".carousel__btn--prev").addEventListener("click",()=>go(index-1));
  carousel.querySelector(".carousel__btn--next").addEventListener("click",()=>go(index+1));
  dots.forEach((dot,i)=>dot.addEventListener("click",()=>go(i)));
  carousel.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){e.preventDefault();go(index-1)}if(e.key==="ArrowRight"){e.preventDefault();go(index+1)}});
  carousel.addEventListener("mouseenter",()=>setPaused(true));
  carousel.addEventListener("mouseleave",()=>setPaused(false));
  carousel.addEventListener("focusin",()=>setPaused(true));
  carousel.addEventListener("focusout",e=>{if(!carousel.contains(e.relatedTarget))setPaused(false)});

  track.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;dragging=true;moved=false;startX=e.clientX;deltaX=0;track.style.transition="none"});
  window.addEventListener("pointermove",e=>{if(!dragging)return;deltaX=e.clientX-startX;if(Math.abs(deltaX)>8)moved=true;if(moved)track.style.transform=`translateX(calc(${-100*index}% + ${deltaX}px))`});
  window.addEventListener("pointerup",()=>{if(!dragging)return;dragging=false;track.style.transition="";if(Math.abs(deltaX)>60)go(index+(deltaX<0?1:-1));else go(index)});
  track.addEventListener("click",e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true);
  track.addEventListener("dragstart",e=>e.preventDefault());

  const visibility=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){if(!paused)schedule()}else clearTimeout(timer)},{threshold:.3});
  visibility.observe(carousel);
  go(0);
})();
