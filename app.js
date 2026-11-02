const $=s=>document.querySelector(s);let chart=null,current='traction',lastResult=null;
const materials={
 steel:{name:'Acero al carbono',E:210000,fy:250,fu:450,duct:22,hard:180,impact:80,color:'#66899b'},
 aluminium:{name:'Aleación de aluminio',E:70000,fy:150,fu:280,duct:18,hard:95,impact:25,color:'#b2a58a'},
 copper:{name:'Cobre',E:120000,fy:70,fu:220,duct:35,hard:85,impact:100,color:'#bd8059'},
 cast:{name:'Fundición gris',E:110000,fy:130,fu:180,duct:0.8,hard:210,impact:8,color:'#717c84'}
};
const fmt=(n,d=1)=>Number(n).toLocaleString('es-ES',{maximumFractionDigits:d});
const options=Object.entries(materials).map(([k,m])=>`<option value="${k}">${m.name}</option>`).join('');
function field(label,id,value,unit,step='any',min=0,max=100000){return `<div class="field"><label for="${id}">${label}<span id="${id}-out">${value} ${unit}</span></label><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${value}"></div>`}
function rangeField(label,id,value,unit,min,max,step){return `<div class="field"><label for="${id}">${label}<span id="${id}-out">${value} ${unit}</span></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`}
function materialField(){return `<div class="field"><label for="material">Material de la probeta</label><select id="material">${options}</select></div>`}
function shell(title,subtitle,tag,controls,svg,note){$('#test-panel').innerHTML=`<div class="panel-head"><div><p class="eyebrow">SIMULADOR INTERACTIVO</p><h2>${title}</h2><p>${subtitle}</p></div><span class="tag">${tag}</span></div><div class="lab-grid"><aside class="controls"><div class="section-label">01 / PARÁMETROS DE ENSAYO</div>${controls}<div class="actions"><button class="primary" id="run">▶ EJECUTAR ENSAYO</button><button class="secondary" id="reset">↺</button></div></aside><section class="visual"><div class="visual-head"><b>Vista del laboratorio</b><span class="status" id="status">● PREPARADO</span></div><div class="stage" id="stage">${svg}</div><p class="stage-note">${note}</p></section></div><section class="results"><div class="results-head"><h3>02 / RESULTADOS Y ANÁLISIS</h3><span class="mono" style="font-size:9px;color:#81909a">MODELO DIDÁCTICO</span></div><div id="result-content"><p class="stage-note">Configura el ensayo y pulsa «Ejecutar ensayo» para obtener los resultados.</p></div></section>`}
function specimenSVG(kind='traction'){if(kind==='traction')return `<svg viewBox="0 0 620 240" role="img" aria-label="Máquina de tracción"><g fill="none" stroke="#496678" stroke-width="7"><path d="M185 25H435M185 25V205M435 25V205M185 205H435"/></g><rect x="265" y="35" width="90" height="18" fill="#294e65"/><rect x="285" y="53" width="50" height="48" rx="4" fill="#a5b6bf"/><path d="M310 101V125" stroke="#f28c28" stroke-width="5"/><path id="specimen" d="M300 125H320V172H300Z" fill="#9aabb4" stroke="#617987" stroke-width="1.5"/><path d="M285 172H335V190H285Z" fill="#a5b6bf"/><g stroke="#f28c28" stroke-width="2" fill="none"><path d="M310 20V8m-5 5 5-5 5 5"/><path d="M310 205v16m-5-5 5 5 5-5"/></g><g fill="#637c8b" font-size="10"><text x="448" y="45">Célula de carga</text><text x="448" y="130">Probeta</text><text x="448" y="190">Mordazas</text></g><path d="M435 42H385M435 132H330M435 190H335" stroke="#8fa2ad" stroke-dasharray="3 3"/></svg>`;
if(kind==='brinell')return `<svg viewBox="0 0 620 240"><rect x="105" y="165" width="410" height="42" rx="3" fill="#8fa2ad"/><path d="M105 165H515" stroke="#506f80" stroke-width="3"/><circle id="indenter" cx="310" cy="105" r="43" fill="#d5dfe4" stroke="#58788b" stroke-width="3"/><path d="M310 20V58" stroke="#f28c28" stroke-width="4"/><path d="M302 32L310 20 318 32" fill="none" stroke="#f28c28" stroke-width="2"/><ellipse id="dent" cx="310" cy="165" rx="10" ry="3" fill="#36566a"/><g fill="#657d8a" font-size="11"><text x="420" y="100">Bola de acero / carburo</text><text x="420" y="190">Material ensayado</text></g><path d="M395 98H358M395 186H515" stroke="#90a3ad" stroke-dasharray="3 3"/></svg>`;
if(kind==='vickers')return `<svg viewBox="0 0 620 240"><rect x="105" y="165" width="410" height="42" rx="3" fill="#8fa2ad"/><path d="M105 165H515" stroke="#506f80" stroke-width="3"/><path id="pyramid" d="M310 48L270 125 310 165 350 125Z" fill="#d9e2e7" stroke="#557688" stroke-width="3"/><path d="M310 15V43" stroke="#f28c28" stroke-width="4"/><path d="M302 27L310 15 318 27" fill="none" stroke="#f28c28" stroke-width="2"/><path id="vickersdent" d="M310 164L302 160 310 156 318 160Z" fill="#36566a"/><g fill="#657d8a" font-size="11"><text x="410" y="95">Pirámide de diamante</text><text x="420" y="190">Huella cuadrada</text></g><path d="M400 92H347M400 186H323" stroke="#90a3ad" stroke-dasharray="3 3"/></svg>`;
return `<svg viewBox="0 0 620 240"><path d="M310 25L310 48" stroke="#566f7d" stroke-width="8"/><circle id="pendulum" cx="310" cy="48" r="9" fill="#f28c28"/><path id="swing" d="M310 48L465 168" stroke="#607f90" stroke-width="8" stroke-linecap="round"/><circle id="hammer" cx="465" cy="168" r="20" fill="#a9b9c2" stroke="#506e80" stroke-width="3"/><path d="M125 180H495" stroke="#617d8c" stroke-width="5"/><path d="M270 180L280 160H340L350 180Z" fill="#899da8"/><path d="M296 159L302 150 308 159 314 150 320 159" fill="none" stroke="#334e5e" stroke-width="3"/><path d="M310 48A180 180 0 0 1 475 180" fill="none" stroke="#aebdc5" stroke-dasharray="4 5" stroke-width="2"/><g fill="#657d8a" font-size="11"><text x="110" y="35">Péndulo</text><text x="370" y="222">Probeta entallada</text></g></svg>`}
function initTraction(){shell('Ensayo de tracción','Determina cómo responde un material cuando se somete a una fuerza de tracción.','ASTM E8 · MODELO',materialField()+field('Diámetro inicial','diameter',10,'mm','0.1',1,50)+field('Longitud inicial','length',50,'mm','1',10,200)+field('Fuerza máxima','force',30,'kN','1',1,300)+field('Área inicial (calculada)','area',78.54,'mm²','0.01',1,2000),specimenSVG('traction'),'La máquina sujeta la probeta y aumenta progresivamente la carga. Observa el alargamiento, la estricción y la posible rotura.');
$('#material').value='steel';$('#area').readOnly=true;
const upd=()=>{$('#area').value=fmt(Math.PI*Number($('#diameter').value)**2/4,2)};$('#diameter').addEventListener('input',upd);
$('#run').onclick=runTraction;$('#reset').onclick=initTraction}
function stressCurve(mat){
  const fy=mat.fy, fu=mat.fu, epsY=fy/mat.E, epsU=Math.max(epsY*2,mat.duct/100), end=Math.max(epsU*1.08,epsY*3);
  const pts=[];
  for(let i=0;i<=120;i++){
    const e=end*i/120;
    let stress;
    if(e<=epsY) stress=mat.E*e;
    else if(e<=epsU) stress=fy+(fu-fy)*(e-epsY)/(epsU-epsY);
    else stress=fu*(1-.75*(e-epsU)/(end-epsU));
    pts.push({x:e*100,y:Math.max(0,stress)});
  }
  return pts;
}
function runTraction(){
  const m=materials[$('#material').value], d=+$('#diameter').value, L=+$('#length').value, F=+$('#force').value;
  if(!(d>0&&L>0&&F>=0)){alert('Introduce diámetro y longitud positivos, y una fuerza no negativa.');return}
  const A=Math.PI*d*d/4, stress=F*1000/A, strain=stress/m.E, eps=strain*100;
  const fracture=stress>=m.fu, yield=stress>=m.fy, ext=strain*L;
  const specimen=$('#specimen'), status=$('#status'), run=$('#run');
  run.disabled=true;run.textContent='ENSAYO EN CURSO…';
  specimen.classList.remove('fracture');
  specimen.setAttribute('transform','');
  const curve=stressCurve(m);
  const data=curve.filter(p=>p.x<=eps);
  if(!data.length||data[data.length-1].x<eps)data.push({x:eps,y:stress});
  showMetrics([['TENSIÓN APLICADA',fmt(stress,1),'MPa'],['ALARGAMIENTO ESTIMADO',fmt(ext,2),'mm'],['SECCIÓN INICIAL',fmt(A,2),'mm²']]);
  drawChart('Deformación (%)','Esfuerzo (MPa)',[
    {label:'Curva esfuerzo-deformación estimada',data:curve,parsing:false,borderColor:'#dce3e7',borderWidth:2,pointRadius:0},
    {label:'Trayectoria hasta la carga aplicada',data:[{x:0,y:0}],parsing:false,borderColor:'#1d6686',backgroundColor:'#1d6686',borderWidth:3,pointRadius:0},
    {label:'Estado actual',data:[{x:0,y:0}],showLine:false,pointRadius:6,pointBackgroundColor:'#f28c28'}
  ]);
  const chartData=chart.data.datasets;
  $('#result-content').insertAdjacentHTML('beforeend',`<div class="calculation">
    <h4>DESARROLLO DE LOS CÁLCULOS</h4>
    <div class="calc-row"><span>1. Sección inicial</span><code>A = π · d² / 4 = π · ${fmt(d,2)}² / 4</code><strong>${fmt(A,2)} mm²</strong></div>
    <div class="calc-row"><span>2. Tensión aplicada</span><code>σ = F / A = (${fmt(F,2)} · 1000) / ${fmt(A,2)}</code><strong>${fmt(stress,2)} MPa</strong></div>
    <div class="calc-row"><span>3. Deformación unitaria estimada</span><code>ε = σ / E = ${fmt(stress,2)} / ${fmt(m.E,0)}</code><strong>${fmt(strain,5)} (${fmt(eps,3)} %)</strong></div>
    <div class="calc-row"><span>4. Alargamiento estimado</span><code>ΔL = ε · L₀ = ${fmt(strain,5)} · ${fmt(L,2)}</code><strong>${fmt(ext,3)} mm</strong></div>
    <p class="calc-note">La expresión ε = σ/E es válida en la zona elástica. Si se supera el límite elástico, el alargamiento real requiere una curva constitutiva completa; aquí se muestra una estimación simplificada.</p>
  </div><div class="explanation" id="traction-explanation">La máquina está preparada para iniciar la aplicación gradual de la carga.</div>`);
  const explanation=$('#traction-explanation');
  const duration=8500, started=performance.now();
  function frame(now){
    const t=Math.min(1,(now-started)/duration);
    const eased=t*t*(3-2*t);
    const currentStress=stress*eased, currentEps=eps*eased;
    const neck=yield?Math.min(1,Math.max(0,(currentStress-m.fy)/Math.max(1,m.fu-m.fy))):0;
    const width=10-3.5*neck;
    const bottom=172+Math.min(22,ext*2.5*eased);
    const mid=(125+bottom)/2;
    const topWidth=10, waistWidth=fracture&&t>.97?3:width;
    specimen.setAttribute('d',`M${310-topWidth} 125 L${310-topWidth} ${mid-13} L${310-waistWidth} ${mid} L${310-waistWidth} ${bottom-4} L${310+waistWidth} ${bottom-4} L${310+waistWidth} ${mid} L${310+topWidth} ${mid-13} L${310+topWidth} 125 Z`);
    const progressData=curve.filter(p=>p.x<=currentEps);
    if(!progressData.length||progressData[progressData.length-1].x<currentEps)progressData.push({x:currentEps,y:currentStress});
    chartData[1].data=progressData;
    chartData[2].data=[{x:currentEps,y:currentStress}];
    chart.update('none');
    status.textContent=t<1?'● APLICANDO CARGA · '+Math.round(t*100)+' %':fracture?'● ROTURA':'● ENSAYO COMPLETADO';
    explanation.textContent=t<1
      ? 'Aplicación gradual de la carga: '+fmt(F*eased,1)+' kN. Tensión instantánea estimada: '+fmt(currentStress,1)+' MPa. Observa cómo se alarga y se estrecha la zona central de la probeta.'
      : fracture
        ? 'ROTURA: la tensión aplicada supera la resistencia máxima estimada del material. La probeta se separa en la zona estrechada. La animación es esquemática.'
        : yield
          ? 'DEFORMACIÓN PLÁSTICA: se ha superado el límite elástico estimado. La zona central se estrecha; en un ensayo real puede quedar deformación permanente al retirar la carga.'
          : 'ZONA ELÁSTICA: la tensión queda por debajo del límite elástico estimado. En esta aproximación, la probeta recuperaría su longitud al descargarla.';
    if(t<1){requestAnimationFrame(frame);return}
    if(fracture){
      specimen.classList.add('fracture');
      specimen.setAttribute('d','M300 125H320L317 148 312 154 319 161 311 173 300 174Z');
      specimen.insertAdjacentHTML('afterend','<path d="M300 178H309L316 185 320 192" fill="none" stroke="#f28c28" stroke-width="2" stroke-dasharray="3 3"/>');
    }
    run.disabled=false;run.textContent='▶ REPETIR ENSAYO';
  }
  status.textContent='● INICIANDO ENSAYO';
  requestAnimationFrame(frame);
}
function initBrinell(){shell('Ensayo de dureza Brinell','Una bola presiona la superficie. La huella permite estimar la resistencia a la penetración.','UNE-EN ISO 6506',materialField()+field('Diámetro de bola (D)','ball',10,'mm','0.5',1,10)+field('Carga aplicada (F)','load',3000,'kgf','100',100,30000)+field('Diámetro de huella (d)','dentdiam',4,'mm','0.1',0.1,9.9),specimenSVG('brinell'),'La bola penetra en la superficie durante un tiempo de aplicación de carga. Cuanto menor sea la huella para unas mismas condiciones, mayor será la dureza.');
$('#material').value='steel';$('#run').onclick=runBrinell;$('#reset').onclick=initBrinell}
function runBrinell(){let m=materials[$('#material').value],D=+$('#ball').value,F=+$('#load').value,d=+$('#dentdiam').value;if(!(D>0&&F>0&&d>0&&d<D)){alert('Introduce valores positivos y una huella menor que el diámetro de la bola.');return}let den=Math.PI*D*(D-Math.sqrt(D*D-d*d)),hb=2*F/den;$('#dent').setAttribute('rx',Math.max(3,d*6));$('#indenter').setAttribute('r',Math.max(15,43-d*2));$('#status').textContent='● ENSAYO COMPLETADO';showMetrics([['DUREZA BRINELL',fmt(hb,1),'HBW'],['HUELLA (d)',fmt(d,2),'mm'],['CARGA',fmt(F,0),'kgf']]);drawChart('Diámetro de huella (mm)','Dureza Brinell (HBW)',[{label:'Relación carga–huella (D constante)',data:Array.from({length:18},(_,i)=>{let x=D*(.15+i*.045),v=2*F/(Math.PI*D*(D-Math.sqrt(D*D-x*x)));return{x,y:v}}),parsing:false,borderColor:'#1d6686',pointRadius:0,borderWidth:2}]);$('#result-content').insertAdjacentHTML('beforeend',`<div class="explanation">Se ha calculado HBW = 2F / [πD(D − √(D² − d²))]. La dureza aumenta cuando disminuye el tamaño de la huella para las mismas condiciones. El resultado es una estimación matemática y debe respetar las combinaciones normalizadas de bola y carga.</div>`)}
function initVickers(){shell('Ensayo de dureza Vickers','Una pirámide de diamante deja una huella cuadrada. Medimos sus diagonales.','UNE-EN ISO 6507',materialField()+field('Carga aplicada (F)','vload',30,'kgf','1',1,100)+field('Diagonal media (d)','diagonal',0.4,'mm','0.01',0.05,2),specimenSVG('vickers'),'El penetrador piramidal de diamante se presiona contra el material. Se miden las dos diagonales de la huella y se calcula su valor medio.');
$('#material').value='steel';$('#run').onclick=runVickers;$('#reset').onclick=initVickers}
function runVickers(){let m=materials[$('#material').value],F=+$('#vload').value,d=+$('#diagonal').value;if(!(F>0&&d>0)){alert('La carga y la diagonal deben ser mayores que cero.');return}let hv=1.8544*F/(d*d);$('#vickersdent').setAttribute('transform',`scale(${Math.max(.5,Math.min(2,d*2))})`);$('#status').textContent='● ENSAYO COMPLETADO';showMetrics([['DUREZA VICKERS',fmt(hv,1),'HV'],['DIAGONAL MEDIA',fmt(d,3),'mm'],['CARGA',fmt(F,1),'kgf']]);drawChart('Diagonal media (mm)','Dureza Vickers (HV)',[{label:'Relación carga–diagonal (carga fija)',data:Array.from({length:20},(_,i)=>{let x=d*(.5+i*.08);return{x,y:1.8544*F/(x*x)}}),parsing:false,borderColor:'#1d6686',pointRadius:0,borderWidth:2}]);$('#result-content').insertAdjacentHTML('beforeend',`<div class="explanation">La dureza Vickers se calcula mediante HV = 1,8544 · F / d², con F en kgf y d como diagonal media en mm. Una diagonal menor implica una dureza mayor para la misma carga. La geometría de la huella se representa de forma esquemática.</div>`)}
function initCharpy(){shell('Ensayo de resiliencia Charpy','Un péndulo golpea una probeta entallada. La energía absorbida indica su resistencia al impacto.','UNE-EN ISO 148-1',materialField()+field('Masa del péndulo','mass',20,'kg','0.5',1,100)+field('Altura inicial','height',1.5,'m','0.1',0.1,5)+field('Energía absorbida','absorbed',45,'J','1',0,250),specimenSVG('charpy'),'El péndulo parte de una altura inicial, golpea la probeta y continúa hasta otra altura. La diferencia de energía potencial se emplea para estimar la energía absorbida.');
$('#material').value='steel';$('#run').onclick=runCharpy;$('#reset').onclick=initCharpy}
function runCharpy(){let m=materials[$('#material').value],mass=+$('#mass').value,h=+$('#height').value,E=+$('#absorbed').value;if(!(mass>0&&h>0&&E>=0)){alert('La masa y la altura deben ser positivas y la energía absorbida no puede ser negativa.');return}let initial=mass*9.81*h,max=Math.min(initial,E),ratio=max/initial,remaining=Math.max(0,initial-max),h2=remaining/(mass*9.81),breaks=max>=m.impact,hammer=$('#hammer'),swing=$('#swing');swing.setAttribute('d','M310 48L'+(310+155*Math.sqrt(Math.max(.05,1-ratio)))+' '+(48+120*Math.sqrt(Math.max(.05,ratio))) );hammer.setAttribute('cx',310+155*Math.sqrt(Math.max(.05,1-ratio)));hammer.setAttribute('cy',48+120*Math.sqrt(Math.max(.05,ratio)));$('#status').textContent=breaks?'● ROTURA DE LA PROBETA':'● IMPACTO COMPLETADO';showMetrics([['ENERGÍA ABSORBIDA',fmt(max,1),'J'],['ENERGÍA RESTANTE',fmt(remaining,1),'J'],['ALTURA DE RETORNO',fmt(h2,2),'m']]);drawChart('Estado','Energía (J)',[{label:'Energía',data:[{x:'Inicial',y:initial},{x:'Absorbida',y:max},{x:'Restante',y:remaining}],backgroundColor:['#1d6686','#f28c28','#91a8b5'],borderWidth:0}],'bar');$('#result-content').insertAdjacentHTML('beforeend',`<div class="explanation">${breaks?'En este modelo la energía absorbida alcanza el umbral didáctico asignado al material y la probeta se representa fracturada.':'La energía absorbida queda por debajo del umbral didáctico asignado: la probeta no se considera completamente rota en esta aproximación.'} La energía potencial inicial es m·g·h. La energía restante se transforma en altura de retorno. La tenacidad al impacto real depende también de la geometría, temperatura, entalla y condiciones normalizadas.</div>`)}
function showMetrics(items){$('#result-content').innerHTML='<div class="metrics">'+items.map(x=>`<div class="metric"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('')+'</div><div class="chart-wrap"><canvas id="result-chart" aria-label="Gráfica de resultados"></canvas></div>'}
function drawChart(xlab,ylab,datasets,type='line'){if(chart)chart.destroy();let opts={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{family:'Manrope',size:10},boxWidth:12}}},scales:{x:{title:{display:true,text:xlab},ticks:{font:{size:10}},grid:{color:'#edf1f3'}},y:{title:{display:true,text:ylab},beginAtZero:true,ticks:{font:{size:10}},grid:{color:'#edf1f3'}}}};if(type==='line'){opts.scales.x.type='linear';opts.interaction={mode:'nearest',intersect:false}}chart=new Chart($('#result-chart'),{type,data:{datasets},options:opts})}
function render(test){current=test;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.test===test));({traction:initTraction,brinell:initBrinell,vickers:initVickers,charpy:initCharpy})[test]()}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>render(b.dataset.test)));render('traction');