(function(){
    const monthLabel=document.getElementById('monthLabel');
    const yearLabel=document.getElementById('yearLabel');
    const grid=document.getElementById('calendarGrid');
    const prev=document.getElementById('prev');
    const next=document.getElementById('next');
    const todayBtn=document.getElementById('todayBtn');
    const selectedFull=document.getElementById('selectedFull');
    const selectedShort=document.getElementById('selectedShort');
    const todayShort=document.getElementById('todayShort');
    const eventText=document.getElementById('eventText');
    const eventType=document.getElementById('eventType');
    const addEventBtn=document.getElementById('addEvent');
    const eventsList=document.getElementById('eventsList');
    const filterInputs=document.querySelectorAll('.filter');

    let current=new Date();
    let selectedDate=null;

    const STORAGE_KEY='cal_events_v2';
    let events=loadEvents();

    function loadEvents(){
      try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):{};}catch(e){return{}};
    }
    function saveEvents(){localStorage.setItem(STORAGE_KEY,JSON.stringify(events));}
    function formatISO(d){return d.getFullYear()+ '-' + String(d.getMonth()+1).padStart(2,'0')+ '-' + String(d.getDate()).padStart(2,'0');}
    function pretty(d){return d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}

    function render(){
      grid.innerHTML='';
      const year=current.getFullYear();
      const month=current.getMonth();
      monthLabel.textContent=current.toLocaleString('es-ES',{month:'long',year:'numeric'});
      yearLabel.textContent=year;

      const firstDay=new Date(year,month,1);
      const startIdx=firstDay.getDay();
      const daysInMonth=new Date(year,month+1,0).getDate();
      const prevMonthDays=new Date(year,month,0).getDate();

      const totalCells=42;
      for(let i=0;i<totalCells;i++){
        const cell=document.createElement('div');
        cell.className='day';
        const dayNum=i-startIdx+1;
        let cellDate;
        if(dayNum<=0){cell.classList.add('inactive');cellDate=new Date(year,month-1,prevMonthDays+dayNum);}
        else if(dayNum>daysInMonth){cell.classList.add('inactive');cellDate=new Date(year,month+1,dayNum-daysInMonth);}
        else{cellDate=new Date(year,month,dayNum);}
        const iso=formatISO(cellDate);

        const num=document.createElement('div');num.className='date-num';num.textContent=cellDate.getDate();cell.appendChild(num);

        const today=new Date();if(formatISO(today)===iso){cell.classList.add('today');todayShort.textContent=today.toLocaleDateString('es-ES',{day:'numeric',month:'short'});}
        if(selectedDate&&iso===selectedDate){cell.classList.add('selected');}

        if(events[iso]){
          const activeFilters=getActiveFilters();
          const evWrap=document.createElement('div');evWrap.className='events';
          events[iso].forEach(e=>{if(activeFilters.includes(e.type)){const dot=document.createElement('div');dot.className='dot '+e.type;evWrap.appendChild(dot);}});
          if(evWrap.children.length) cell.appendChild(evWrap);
        }

        cell.addEventListener('click',()=>{selectedDate=iso;updateSelectedPanel();render();});
        grid.appendChild(cell);
      }
      renderEventsList();
    }

    function updateSelectedPanel(){
      if(selectedDate){const d=new Date(selectedDate+'T00:00:00');selectedFull.textContent=pretty(d);selectedShort.textContent=selectedDate;}
      else{selectedFull.textContent='Selecciona una fecha';selectedShort.textContent='—';}
    }

    function renderEventsList(){
      eventsList.innerHTML='';
      const activeFilters=getActiveFilters();
      if(selectedDate){
        const dayEvents=(events[selectedDate]||[]).filter(e=>activeFilters.includes(e.type));
        if(dayEvents.length===0){const p=document.createElement('div');p.className='small';p.textContent='No hay eventos visibles.';eventsList.appendChild(p);return;}
        dayEvents.forEach(item=>{
          const el=document.createElement('div');el.className='event-item';
          el.innerHTML=`<strong>${escapeHtml(item.text)}</strong> <span class=\"small\">(${item.type})</span> <button data-id=\"${item.id}\" style=\"float:right;background:transparent;border:0;color:var(--muted);cursor:pointer\">Eliminar</button>`;
          const btn=el.querySelector('button');btn.addEventListener('click',()=>removeEvent(selectedDate,item.id));
          eventsList.appendChild(el);
        });
      }
    }

    function addEvent(date,text,type){if(!text) return;const id=Date.now()+'-'+Math.random().toString(36).slice(2,8);if(!events[date])events[date]=[];events[date].push({id,text,type});saveEvents();render();eventText.value='';}
    function removeEvent(date,id){if(!events[date])return;events[date]=events[date].filter(e=>e.id!==id);if(events[date].length===0)delete events[date];saveEvents();render();}
    function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[m]));}
    function getActiveFilters(){return Array.from(filterInputs).filter(f=>f.checked).map(f=>f.value);}

    prev.addEventListener('click',()=>{current.setMonth(current.getMonth()-1);render();});
    next.addEventListener('click',()=>{current.setMonth(current.getMonth()+1);render();});
    todayBtn.addEventListener('click',()=>{current=new Date();render();});
    addEventBtn.addEventListener('click',()=>{if(!selectedDate)selectedDate=formatISO(new Date());updateSelectedPanel();const text=eventText.value.trim();if(!text)return eventText.focus();addEvent(selectedDate,text,eventType.value);});
    eventText.addEventListener('keydown',e=>{if(e.key==='Enter'){addEventBtn.click();}});
    filterInputs.forEach(f=>f.addEventListener('change',render));

    selectedDate=formatISO(new Date());
    updateSelectedPanel();
    render();
  })();