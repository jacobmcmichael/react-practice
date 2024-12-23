import { useEffect, useRef, useState } from "react";
import "./App.css";

const SIZE = 100;

type Circle = {
	x: number;
	y: number;

	r: number;
	g: number;
	b: number;
};

type Matrix = {
	values: Circle[];
};

function Drawing() {
	const drawingRef = useRef<HTMLDivElement>(null);

	const [undoShape, setUndoShape] = useState<Circle | undefined>(undefined);
	const [redoMatrix, setRedoMatrix] = useState<Matrix>({ values: [] });
	const [shapesMatrix, setShapesMatrix] = useState<Matrix>({ values: [] });

	const createCircle = (x: number, y: number, r?: number, g?: number, b?: number) => {
		if (drawingRef.current) {
			let red = r || Math.floor(Math.random() * 255);
			let green = g || Math.floor(Math.random() * 255);
			let blue = b || Math.floor(Math.random() * 255);

			let circle = document.createElement("div");

			circle.classList.add("circle");
			circle.style.setProperty("width", `${SIZE}px`);
			circle.style.setProperty("height", `${SIZE}px`);
			circle.style.setProperty("left", `${x}px`);
			circle.style.setProperty("top", `${y}px`);
			circle.style.setProperty("border-color", `rgba(${red}, ${green}, ${blue}, 0.4)`);
			circle.style.setProperty("background-color", `rgba(${red}, ${green}, ${blue}, 0.4)`);

			circle.setAttribute("data-x", `${x}`);
			circle.setAttribute("data-y", `${y}`);
			circle.setAttribute("data-r", `${red}`);
			circle.setAttribute("data-g", `${green}`);
			circle.setAttribute("data-b", `${blue}`);

			drawingRef.current.appendChild(circle);

			setShapesMatrix((matrix) => ({
				values: [...matrix.values, { x, y, r: red, g: green, b: blue }],
			}));
		}
	};

	const handleClick = (event: any) => {
		let adjustedX = event.clientX - SIZE / 2;
		let adjustedY = event.clientY - SIZE / 2;

		createCircle(adjustedX, adjustedY);
	};

	const handleRedo = (event: any) => {
		event.stopPropagation();

		let redoValue = redoMatrix.values.pop();
		if (redoValue) createCircle(redoValue.x, redoValue.y, redoValue.r, redoValue.g, redoValue.b);
	};

	const handleUndo = (event: any) => {
		event.stopPropagation();

		setShapesMatrix((matrix) => {
			let mutatedMatrix = [...matrix.values];

			if (matrix && matrix.values.length > 0) {
				let item = mutatedMatrix.pop();
				setUndoShape(item);
			}

			return { values: mutatedMatrix };
		});
	};

	useEffect(() => {
		console.log(shapesMatrix, redoMatrix);
	}, [shapesMatrix, redoMatrix]);

	useEffect(() => {
		// remove circle
		if (drawingRef.current) {
			let circles = drawingRef.current.querySelectorAll(".circle");

			circles.forEach((circle) => {
				let x = Number(circle.getAttribute("data-x"));
				let y = Number(circle.getAttribute("data-y"));
				let r = Number(circle.getAttribute("data-r"));
				let g = Number(circle.getAttribute("data-g"));
				let b = Number(circle.getAttribute("data-b"));

				if (circle && x && y) {
					console.log(x, y, undoShape);

					if (x === undoShape?.x && y === undoShape?.y) {
						circle.remove();

						setRedoMatrix((matrix) => ({ values: [...matrix.values, { x: x, y: y, r: r, g: g, b: b }] }));
					}
				}
			});
		}
	}, [undoShape]);

	return (
		<div
			ref={drawingRef}
			className="drawing"
			onClick={(event: any) => handleClick(event)}
		>
			<div className="actions">
				<button
					className="redo"
					onClick={(event) => handleRedo(event)}
				>
					Redo
				</button>
				<button
					className="undo"
					onClick={(event) => handleUndo(event)}
				>
					Undo
				</button>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<>
			<Drawing />
		</>
	);
}
