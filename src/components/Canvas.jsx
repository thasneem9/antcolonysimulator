import { useRef, useEffect,useState } from "react";

export default function Canvas() {
  const [tool, setTool] = useState("beetle");
  const canvasRef = useRef(null);
  const antsRef = useRef([]);
  const beetlesRef = useRef([]);
  const pheromonesRef = useRef([]);
  const obstaclesRef = useRef([]);

  useEffect(() => {
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const nestX = 850;
    const nestY = 150;

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
  !beetle.taken &&
  distance < DETECTION_RADIUS
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

    if (beetle.attachedAnts.length >= beetle.weight) {

      beetle.taken = true;

beetle.leader = beetle.attachedAnts[0];

        beetle.attachedAnts.forEach(a => {

            a.carryingBeetle = beetle;
            a.targetBeetle = null;

        });

    }

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

  if (distance < NEST_RADIUS) {

    beetlesRef.current =
      beetlesRef.current.filter(
        beetle => beetle !== ant.carryingBeetle
      );

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

    ant.x += Math.cos(ant.angle) * ant.speed;
    ant.y += Math.sin(ant.angle) * ant.speed;

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

    function drawAnts() {
      antsRef.current.forEach((ant) => {
        ctx.beginPath();
       ctx.fillStyle =
  ant.carryingBeetle
    ? "#00ffff"
    : ant.targetBeetle
    ? "#ff4444"
    : "#e8e8e8";
        ctx.arc(
          ant.x,
          ant.y,
          3,
          0,
          Math.PI * 2
        );

        ctx.fill();
      });
    }

    function drawBeetles() {
      beetlesRef.current.forEach((beetle) => {
        ctx.beginPath();

        ctx.fillStyle = "#39ff14";

        ctx.arc(
          beetle.x,
          beetle.y,
          8,
          0,
          Math.PI * 2
        );

        ctx.fill();
        ctx.fillStyle = "white";

ctx.font = "12px Arial";

ctx.fillText(

    beetle.weight,

    beetle.x-4,

    beetle.y-12

);
      });
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

    obstaclesRef.current.forEach(obstacle=>{

        ctx.fillStyle="#555";

        ctx.fillRect(

            obstacle.x,

            obstacle.y,

            obstacle.width,

            obstacle.height

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

        weight:Math.floor(Math.random()*5)+1,

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
    <>
    <div
style={{
display:"flex",
gap:"10px",
marginBottom:"15px"
}}
>

<button
onClick={()=>setTool("beetle")}
>

Beetle

</button>

<button
onClick={()=>setTool("wall")}
>

Wall

</button>

</div>
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      width={1000}
      height={700}
      style={{
        border: "1px solid white",
        background: "#3c06a1",
      }}
    />
    </>
  );
}