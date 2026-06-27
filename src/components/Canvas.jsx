import { useRef, useEffect,useState } from "react";
function Stat({label,value}){

return(

<div
style={{

display:"flex",

justifyContent:"space-between",

padding:"12px 0",

borderBottom:"1px solid #2b2b2b"

}}
>

<span>{label}</span>

<strong
style={{

color:"#55ff9d"

}}
>

{value}

</strong>

</div>

);

}

export default function Canvas() {
const [stats, setStats] = useState({

    ants:0,

    beetles:0,

    foodPheromones:0,

    helpPheromones:0,

    walls:0,

    delivered:0

});
  const [tool, setTool] = useState("beetle");
  const canvasRef = useRef(null);
  const antsRef = useRef([]);
  const beetlesRef = useRef([]);
  const pheromonesRef = useRef([]);
  const obstaclesRef = useRef([]);

  useEffect(() => {
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const nestX = 770;
    const nestY = 210;

    // Create ants once
    antsRef.current = [];

    for (let i = 0; i < 50; i++) {
    antsRef.current.push({
  x: nestX + (Math.random() - 0.5) * 80,
  y: nestY + (Math.random() - 0.5) * 80,
  angle: Math.random() * Math.PI * 2,
  speed: 1.5,

 targetBeetle: null,
carryingBeetle: null,
pheromoneCooldown: 0,
});
    }

    function drawNest() {
      ctx.shadowColor = "#ffb347";
      ctx.shadowBlur = 25;
      ctx.strokeStyle = "#ffb347";
      ctx.lineWidth = 20;

      ctx.beginPath();
      ctx.arc(
        nestX,
        nestY,
        60,
        Math.PI,
        0,
        false
      );
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

  function updateAnts() {
  const DETECTION_RADIUS = 80;
  const PHEROMONE_RADIUS = 60;
const PICKUP_RADIUS = 12;


const NEST_RADIUS = 60;
  antsRef.current.forEach((ant) => {

    // DETECT BEETLE
    if (!ant.targetBeetle && !ant.carryingBeetle) {
  for (const beetle of beetlesRef.current) {

    const dx = beetle.x - ant.x;
    const dy = beetle.y - ant.y;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

  if (
    distance < DETECTION_RADIUS &&
    (
        !beetle.taken ||
        beetle.attachedAnts.length < beetle.weight
    )
) {

    ant.targetBeetle = beetle;
    break;

}
  }
}


   if (
  ant.targetBeetle &&
  !ant.carryingBeetle
) {
  const dx =
    ant.targetBeetle.x - ant.x;

  const dy =
    ant.targetBeetle.y - ant.y;

  const distance =
    Math.sqrt(dx * dx + dy * dy);

 if (distance < PICKUP_RADIUS) {

    const beetle = ant.targetBeetle;
    if(
    beetle.weight > 1 &&
    beetle.attachedAnts.length < beetle.weight
){

    ant.pheromoneCooldown--;

    if(ant.pheromoneCooldown<=0){

        pheromonesRef.current.push({

            x:ant.x,

            y:ant.y,

            strength:100,

            type:"help"

        });

        ant.pheromoneCooldown=15;

    }

}

    beetle.attachedAnts.push(ant);

    if (!beetle.taken) {

    beetle.taken = true;

    beetle.leader = beetle.attachedAnts[0];

}

beetle.attachedAnts.forEach(a => {

    a.carryingBeetle = beetle;
    a.targetBeetle = null;

});

}
}

    // MOVE
if (ant.carryingBeetle) {

  // Turn toward nest
  const targetAngle = Math.atan2(
    nestY - ant.y,
    nestX - ant.x
  );

  ant.angle +=
    (targetAngle - ant.angle) * 0.05;
    ant.pheromoneCooldown--;

if (ant.pheromoneCooldown <= 0) {

    pheromonesRef.current.push({

        x: ant.x,

        y: ant.y,

        strength: 100,

        type: "food"

    });

    ant.pheromoneCooldown = 15;

}

  // Carry beetle
 if (ant.carryingBeetle.leader === ant) {

    ant.carryingBeetle.x = ant.x;
    ant.carryingBeetle.y = ant.y;

}
if (ant.carryingBeetle.leader !== ant) {

    const angle = ant.carryingBeetle.attachedAnts.indexOf(ant)
        * (Math.PI * 2)
        / ant.carryingBeetle.weight;

    ant.x =
        ant.carryingBeetle.x +
        Math.cos(angle) * 12;

    ant.y =
        ant.carryingBeetle.y +
        Math.sin(angle) * 12;

}

  // Deliver to nest
  const dx = nestX - ant.x;
  const dy = nestY - ant.y;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );

if (
    distance < NEST_RADIUS &&
    ant.carryingBeetle.leader === ant
) {

    beetlesRef.current =
      beetlesRef.current.filter(
        beetle => beetle !== ant.carryingBeetle
      );

    setStats(prev => ({

        ...prev,

        delivered: prev.delivered + 1

    }));

    ant.carryingBeetle = null;
    ant.targetBeetle = null;
}

}
else if (ant.targetBeetle) {

  const targetAngle = Math.atan2(
    ant.targetBeetle.y - ant.y,
    ant.targetBeetle.x - ant.x
  );

  ant.angle +=
    (targetAngle - ant.angle) * 0.05;

}
else {
let strongestFood = null;

let strongestHelp = null;

  pheromonesRef.current.forEach((pheromone)=>{

    const dx = pheromone.x - ant.x;
    const dy = pheromone.y - ant.y;

    const distance =
      Math.sqrt(dx*dx + dy*dy);

    if(distance < PHEROMONE_RADIUS){

     if(pheromone.type==="food"){

    if(
        !strongestFood ||
        pheromone.strength>
        strongestFood.strength
    ){

        strongestFood=pheromone;

    }

}
else{

    if(
        !strongestHelp ||
        pheromone.strength>
        strongestHelp.strength
    ){

        strongestHelp=pheromone;

    }

}

    }

  });

  const strongest =
    strongestHelp ||
    strongestFood;

if(strongest){

    const targetAngle = Math.atan2(

      strongest.y - ant.y,

      strongest.x - ant.x

    );

    ant.angle +=
      (targetAngle-ant.angle)*0.05;

  }

  else{

    ant.angle +=
      (Math.random()-0.5)*0.1;

  }

}
if (
    !ant.carryingBeetle ||
    ant.carryingBeetle.leader === ant
) {

let moveSpeed = ant.speed;

if (ant.carryingBeetle) {

    const beetle = ant.carryingBeetle;

    const helpers = beetle.attachedAnts.length;

    const effort =
        Math.min(
            helpers / beetle.weight,
            1
        );

    moveSpeed =
        ant.speed * effort;

}

const nextX =
    ant.x +
    Math.cos(ant.angle) * moveSpeed;

const nextY =
    ant.y +
    Math.sin(ant.angle) * moveSpeed;

    let blocked = false;

    obstaclesRef.current.forEach(obstacle => {

        if (

            nextX > obstacle.x &&

            nextX < obstacle.x + obstacle.width &&

            nextY > obstacle.y &&

            nextY < obstacle.y + obstacle.height

        ) {

            blocked = true;

        }

    });

    if (!blocked) {

        ant.x = nextX;
        ant.y = nextY;

    }

    else {

        ant.angle +=
            (Math.random() - 0.5) * 2;

    }

}
    if (ant.carryingBeetle) {

  ant.carryingBeetle.x =
    ant.x + 10;

  ant.carryingBeetle.y =
    ant.y + 10;

}

    // BOUNDARIES
    if (ant.x < 0 || ant.x > canvas.width) {
      ant.angle = Math.PI - ant.angle;
    }

    if (ant.y < 0 || ant.y > canvas.height) {
      ant.angle = -ant.angle;
    }

  });
}

   function drawAnt(ant){

    ctx.save();

    ctx.translate(ant.x, ant.y);
    ctx.rotate(ant.angle);

    // BODY

    ctx.fillStyle="#ddd";

    // abdomen
    ctx.beginPath();
    ctx.ellipse(-4,0,3.5,2.8,0,0,Math.PI*2);
    ctx.fill();

    // thorax
    ctx.beginPath();
    ctx.arc(0,0,2.3,0,Math.PI*2);
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.arc(4,0,1.8,0,Math.PI*2);
    ctx.fill();

    // LEGS

    ctx.strokeStyle="#ddd";
    ctx.lineWidth=0.8;

    [-2,0,2].forEach(y=>{

        ctx.beginPath();
        ctx.moveTo(-0.5,y);

        ctx.lineTo(-5,y-3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-0.5,y);

        ctx.lineTo(-5,y+3);
        ctx.stroke();

    });

    // ANTENNAE

    ctx.beginPath();
    ctx.moveTo(5,-0.5);
    ctx.lineTo(8,-3);

    ctx.moveTo(5,0.5);
    ctx.lineTo(8,3);

    ctx.stroke();

    ctx.restore();
}

   function drawBeetle(beetle){

    ctx.save();

    ctx.translate(beetle.x, beetle.y);

    const size=[
        6,
        7,
        8,
        10,
        13,
        16,
        20
    ][beetle.weight-1];

    let shell="#1b1b1b";

    if(beetle.weight==2) shell="#2b2119";
    if(beetle.weight==3) shell="#264326";
    if(beetle.weight==4) shell="#46361f";
    if(beetle.weight==5) shell="#4d2416";
    if(beetle.weight==6) shell="#222";
    if(beetle.weight==7) shell="#111";

    ctx.shadowColor="black";
    ctx.shadowBlur=8;
    ctx.shadowOffsetY=2;

    //-------------------------
    // legs
    //-------------------------

    ctx.strokeStyle="#111";
    ctx.lineWidth=1.4;

    [-0.8,0,0.8].forEach(y=>{

        ctx.beginPath();
        ctx.moveTo(-size*0.2,y*size);
        ctx.lineTo(-size*0.9,y*size-size*0.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(size*0.2,y*size);
        ctx.lineTo(size*0.9,y*size-size*0.6);
        ctx.stroke();

    });

    //-------------------------
    // body
    //-------------------------

    ctx.fillStyle=shell;

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        size,
        size*1.25,
        0,
        0,
        Math.PI*2
    );

    ctx.fill();

    //-------------------------
    // glossy shell
    //-------------------------

    const g=
    ctx.createRadialGradient(
        -size/3,
        -size/2,
        1,
        0,
        0,
        size
    );

    g.addColorStop(0,"rgba(255,255,255,.45)");
    g.addColorStop(1,"rgba(255,255,255,0)");

    ctx.fillStyle=g;

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        size,
        size*1.25,
        0,
        0,
        Math.PI*2
    );

    ctx.fill();

    //-------------------------
    // wing split
    //-------------------------

    ctx.strokeStyle="#555";
    ctx.lineWidth=1;

    ctx.beginPath();

    ctx.moveTo(0,-size*1.2);
    ctx.lineTo(0,size*1.2);

    ctx.stroke();

    //-------------------------
    // head
    //-------------------------

    ctx.fillStyle="#111";

    ctx.beginPath();

    ctx.arc(
        0,
        -size*1.45,
        size*0.45,
        0,
        Math.PI*2
    );

    ctx.fill();

    //-------------------------
    // antennae
    //-------------------------

    ctx.strokeStyle="#111";

    ctx.beginPath();

    ctx.moveTo(-2,-size*1.7);
    ctx.quadraticCurveTo(-7,-size*2.3,-10,-size*2.8);

    ctx.moveTo(2,-size*1.7);
    ctx.quadraticCurveTo(7,-size*2.3,10,-size*2.8);

    ctx.stroke();

    //-------------------------
    // Stag Beetle
    //-------------------------

    if(beetle.weight==5){

        ctx.beginPath();

        ctx.moveTo(-2,-size*1.8);
        ctx.lineTo(-8,-size*2.7);

        ctx.moveTo(2,-size*1.8);
        ctx.lineTo(8,-size*2.7);

        ctx.stroke();

    }

    //-------------------------
    // Rhino Beetle
    //-------------------------

    if(beetle.weight==6){

        ctx.lineWidth=2;

        ctx.beginPath();

        ctx.moveTo(0,-size*1.8);
        ctx.lineTo(0,-size*3);

        ctx.stroke();

    }

    //-------------------------
    // Goliath Beetle
    //-------------------------

    if(beetle.weight==7){

        ctx.strokeStyle="#ddd";
        ctx.lineWidth=2;

        for(let i=-2;i<=2;i++){

            ctx.beginPath();

            ctx.moveTo(i*2,-size);

            ctx.lineTo(i*2,size);

            ctx.stroke();

        }

    }

    //-------------------------
    // weight label
    //-------------------------

    ctx.shadowBlur=0;

    ctx.fillStyle="white";
    ctx.font="bold 12px Arial";
    ctx.textAlign="center";

    ctx.fillText(
        beetle.weight,
        0,
        -size-8
    );

    ctx.restore();

}
    function drawAnts(){

    antsRef.current.forEach(drawAnt);

}
function drawBeetles(){

    beetlesRef.current.forEach(drawBeetle);

}
    function drawPheromones() {

    pheromonesRef.current.forEach((pheromone)=>{

        ctx.beginPath();
ctx.shadowBlur = 10;

if (pheromone.type === "food") {

    ctx.shadowColor = "#ffff00";

    ctx.fillStyle =
    `rgba(255,255,0,${
        pheromone.strength/100
    })`;

}
else{

    ctx.shadowColor = "#00bfff";

    ctx.fillStyle =
    `rgba(0,191,255,${
        pheromone.strength/100
    })`;

}

        ctx.arc(

            pheromone.x,

            pheromone.y,

            2,

            0,

            Math.PI*2

        );

        ctx.fill();
        ctx.shadowBlur = 0;

    });

}
function drawObstacles(){

    obstaclesRef.current.forEach(wall=>{

        const brickW = 18;
        const brickH = 10;

        // subtle shadow
        ctx.shadowColor="rgba(0,0,0,.45)";
        ctx.shadowBlur=8;
        ctx.shadowOffsetY=3;

        // stone background
        ctx.fillStyle="#8d5b47";
        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );

        ctx.shadowBlur=0;

        // bricks
        for(let row=0; row<wall.height/brickH; row++){

            const offset =
                row%2===0 ? 0 : brickW/2;

            for(
                let col=-1;
                col<wall.width/brickW+1;
                col++
            ){

                const x =
                    wall.x+
                    col*brickW+
                    offset;

                const y=
                    wall.y+
                    row*brickH;

                // slight random colour
                const reds=[
                    "#8a3c2b",
                    "#96412e",
                    "#7c3626",
                    "#a14d37",
                    "#8f4736"
                ];

                ctx.fillStyle=
                    reds[(row+col)%reds.length];

                ctx.fillRect(
                    x+1,
                    y+1,
                    brickW-2,
                    brickH-2
                );
            }
        }

        // mortar
        ctx.strokeStyle="#c7b7aa";
        ctx.lineWidth=1;

        // horizontal mortar
        for(
            let y=wall.y;
            y<=wall.y+wall.height;
            y+=brickH
        ){

            ctx.beginPath();
            ctx.moveTo(wall.x,y);
            ctx.lineTo(wall.x+wall.width,y);
            ctx.stroke();

        }

        // vertical mortar
        for(let row=0; row<wall.height/brickH; row++){

            const offset=
                row%2===0 ? 0 : brickW/2;

            for(
                let x=wall.x+offset;
                x<=wall.x+wall.width;
                x+=brickW
            ){

                ctx.beginPath();
                ctx.moveTo(
                    x,
                    wall.y+row*brickH
                );

                ctx.lineTo(
                    x,
                    wall.y+(row+1)*brickH
                );

                ctx.stroke();
            }
        }

        // border
        ctx.strokeStyle="#5b2c20";
        ctx.lineWidth=2;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );

    });

}

    function animate() {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
pheromonesRef.current.forEach((pheromone)=>{

    pheromone.strength -= 0.3;

});

pheromonesRef.current =
pheromonesRef.current.filter(

    pheromone=>pheromone.strength>0

);
     drawNest();

updateAnts();

drawPheromones();
drawObstacles();

drawAnts();

drawBeetles();
setStats(prev => ({

    ...prev,

    ants: antsRef.current.length,

    beetles: beetlesRef.current.length,

    foodPheromones:
        pheromonesRef.current.filter(
            p => p.type === "food"
        ).length,

    helpPheromones:
        pheromonesRef.current.filter(
            p => p.type === "help"
        ).length,

    walls:
        obstaclesRef.current.length

}));

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

if(tool==="beetle"){

    beetlesRef.current.push({

        x,

        y,

        weight: Math.floor(Math.random() * 7) + 1,

        taken:false,

        attachedAnts:[],

        leader:null

    });

}else if(tool==="wall"){

    obstaclesRef.current.push({

        x,

        y,

        width:60,

        height:60

    });

}
  }

return (
<div
style={{
display:"flex",
height:"100vh",
background:"#0d1117",
overflow:"hidden",
color:"white",
fontFamily:"Inter, sans-serif"
}}
>

{/* Canvas Area */}

<div
style={{
flex:1,
display:"flex",
justifyContent:"center",
alignItems:"center"
}}
>

<canvas
ref={canvasRef}
onClick={handleCanvasClick}
width={900}
height={700}
style={{
background:"#1d2240",
display:"block"
}}
/>

</div>

{/* Dashboard */}

<div
style={{
width:340,
height:"100vh",
background:"#171c29",
borderLeft:"1px solid #2b3344",
padding:"30px 38px 30px 30px",
boxSizing:"border-box",
display:"flex",
flexDirection:"column",

overflowY:"auto",
overflowX:"hidden",

}}
>

<h1
style={{
    margin:0,
    marginBottom:30,
    fontSize:18,
    fontWeight:700,
    color:"#8bc6ff",

    textAlign:"center",
    lineHeight:1.15
}}
>
ANT COLONY
</h1>

{/* Tool Buttons */}

<div
style={{
display:"flex",
gap:12,
marginBottom:35,

}}
>

<button
onClick={()=>setTool("beetle")}
style={{
flex:1,
padding:"14px",
border:"none",
borderRadius:12,
cursor:"pointer",
fontSize:16,
fontWeight:600,
background:
tool==="beetle"
? "#3b82f6"
: "#242c3d",
color:"white",
transition:"0.2s",
}}
>
 Beetle
</button>

<button
onClick={()=>setTool("wall")}
style={{
flex:1,
padding:"14px",
border:"none",
borderRadius:12,
cursor:"pointer",
fontSize:16,
fontWeight:600,
background:
tool==="wall"
? "#10b981"
: "#242c3d",
color:"white",
transition:"0.2s"
}}
>
 Wall
</button>

</div>

<h3
style={{
marginTop:0,
marginBottom:20,
color:"#7f91b2",
letterSpacing:1
}}
>
SIMULATION
</h3>

<Stat
label="Ants"
value={stats.ants}
/>

<Stat
label="Beetles"
value={stats.beetles}
/>

<Stat
label="Walls"
value={stats.walls}
/>

<Stat
label="Food Trails"
value={stats.foodPheromones}
/>

<Stat
label="Help Trails"
value={stats.helpPheromones}
/>

<Stat
label="Delivered"
value={stats.delivered}
/>

<div
style={{
flex:1
}}
/>

<div
style={{
paddingTop:25,
borderTop:"1px solid #2b3344",
color:"#6d7c97",
fontSize:14,
lineHeight:1.6
}}
>

<b style={{color:"#9ecbff"}}>Controls</b>

<br/>

 Click to place beetles

<br/>

Switch tool to place walls

<br/>

 Ants cooperate automatically

</div>

</div>

</div>
);
}