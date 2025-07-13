import "./style.css";
import Point from "./struct/Point";
import Mouse from "./struct/Mouse";
import Chain from "./struct/Chain";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const FULL_ARC = Math.PI * 2;
const ARC_RADIUS = 10;

const mouse = new Mouse();
const ctx = canvas.getContext("2d")!;

const pointChain = new Chain<Point>(
  ...Array.from({ length: 4 }, (_, k) => new Point(k * 100 + 100, 100))
);

const xDivs = 10; // divisions for temperature
const yDivs = 5; // divisions for % speed

const bgColor = "#0f0f0f";
const gridColor = "#2a2a2a";
const textColor = "#cccccc";

function drawFullCanvasGrid() {
  const width = canvas.width;
  const height = canvas.height;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  const xStep = width / xDivs;
  const yStep = height / yDivs;

  ctx.beginPath();

  for (let i = 0; i <= xDivs; i++) {
    const x = i * xStep;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let j = 0; j <= yDivs; j++) {
    const y = j * yStep;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();

  // Labels
  ctx.fillStyle = textColor;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= xDivs; i++) {
    const x = i * xStep;
    const label = `${(i * 100) / xDivs}°C`;
    ctx.fillText(label, x, height - 18);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let j = 0; j <= yDivs; j++) {
    const y = j * yStep;
    const label = `${100 - (j * 100) / yDivs}%`;
    ctx.fillText(label, 4, y);
  }
}

requestAnimationFrame(animate);
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFullCanvasGrid();

  // Draw lines
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (const node of pointChain) {
    const next = node.next?.data;
    const point = node.data;
    if (next) {
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(next.x, next.y);
    }
  }

  const headNode = pointChain.getHead();
  if (headNode) {
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, headNode.data.y);
    ctx.moveTo(0, headNode.data.y);
    ctx.lineTo(headNode.data.x, headNode.data.y);
  }
  const tailNode = pointChain.getTail();
  if (tailNode) {
    ctx.moveTo(tailNode.data.x, tailNode.data.y);
    ctx.lineTo(canvas.width, 0);
  }
  ctx.stroke();

  // Draw circles
  ctx.fillStyle = "whitesmoke";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  for (const node of pointChain) {
    const p = node.data;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ARC_RADIUS, 0, FULL_ARC);
    ctx.stroke();
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

function handleMouseMove(e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;

  if (!mouse.downed) return;

  const dx = mouse.x - mouse.downX;
  const dy = mouse.y - mouse.downY;

  for (const node of pointChain) {
    const point = node.data;
    if (!isHoveringArc(mouse, point, ARC_RADIUS)) continue;

    point.x += dx;
    point.y += dy;

    const nextNode = node.next;
    const prevNode = node.prev;
    if (prevNode) {
      const prev = prevNode.data;
      if (point.x < prev.x) point.x = prev.x;
      if (point.y > prev.y) point.y = prev.y;
    }
    if (nextNode) {
      const next = nextNode.data;
      if (point.x > next.x) point.x = next.x;
      if (point.y < next.y) point.y = next.y;
    }

    mouse.downX = mouse.x;
    mouse.downY = mouse.y;
  }
}

function handleMouseUp() {
  mouse.downed = false;
}

function handleMouseDown(e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  mouse.downY = e.clientY - rect.top;
  mouse.downX = e.clientX - rect.left;
  mouse.downed = true;
}

function isHoveringArc(p: Point, c: Point, radius: number) {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return dx * dx + dy * dy <= radius * radius;
}

canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
