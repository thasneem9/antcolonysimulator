import { useRef, useEffect } from "react";

export default function Canvas() {
  const canvasRef = useRef(null);
  const antsRef = useRef([]);
  const beetlesRef = useRef([]);
  const pheromonesRef = useRef([]);

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
 ant.carryingBeetle =
  ant.targetBeetle;

ant.carryingBeetle.taken = true;

ant.targetBeetle = null;
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
  ant.carryingBeetle.x = ant.x + 10;
  ant.carryingBeetle.y = ant.y + 10;

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

  let strongest = null;

  pheromonesRef.current.forEach((pheromone)=>{

    const dx = pheromone.x - ant.x;
    const dy = pheromone.y - ant.y;

    const distance =
      Math.sqrt(dx*dx + dy*dy);

    if(distance < PHEROMONE_RADIUS){

      if(
        !strongest ||
        pheromone.strength > strongest.strength
      ){

        strongest = pheromone;

      }

    }

  });

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

    ant.x += Math.cos(ant.angle) * ant.speed;
    ant.y += Math.sin(ant.angle) * ant.speed;
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
      });
    }
    function drawPheromones() {

    pheromonesRef.current.forEach((pheromone)=>{

        ctx.beginPath();

      ctx.shadowColor = "#ffff00";
ctx.shadowBlur = 10;

ctx.fillStyle =
`rgba(255,255,0,${
pheromone.strength/100
})`;

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

    beetlesRef.current.push({
      x,
      y,
      weight: 5,
      taken:false
    });
  }

  return (
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
  );
}