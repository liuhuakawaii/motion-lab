// Development-only, finite observations. No diagnostics are included in production.
export function observeFrames(host: HTMLElement) {
  let active = false;
  let longTasks = 0;
  const observer = typeof PerformanceObserver === 'function' && PerformanceObserver.supportedEntryTypes.includes('longtask')
    ? new PerformanceObserver(entries => { longTasks += entries.getEntries().length; }) : null;
  function sample() {
    if(active || document.hidden) return;
    active=true; longTasks=0; observer?.observe({type:'longtask'});
    const intervals: number[]=[];
    let started=0, previous=0;
    function frame(now:number) {
      if(!started) started=now;
      if(previous) intervals.push(now-previous);
      previous=now;
      if(now-started<6000 && !document.hidden) { requestAnimationFrame(frame); return; }
      intervals.sort((a,b)=>a-b);
      const median=intervals[Math.floor(intervals.length/2)] || 0;
      host.dataset.frameSample=JSON.stringify({frames:intervals.length,medianMs:Number(median.toFixed(2)),p95Ms:Number((intervals[Math.floor(intervals.length*.95)]||0).toFixed(2)),longTasks,width:innerWidth,height:innerHeight});
      observer?.disconnect();active=false;
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('pointerdown',sample,{passive:true});
  window.addEventListener('scroll',sample,{passive:true});
  sample();
}
