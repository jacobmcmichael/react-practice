import { useEffect, useRef, useState } from "react";
import "./App.css";

const cells = Array.from({ length: 4 }, (_, index) => index + 1);

function Game() {
	const matrixRef = useRef<HTMLDivElement>(null);
	const [matrix, setMatrix] = useState<string[]>([]);
	const [preview, setPreview] = useState<string[]>([]);
	const [pickedColor, setPickedColor] = useState<string | null>(null);
	const [stats, setStats] = useState({ corrects: 0, mistakes: 0 });

	const generateColor = () =>
		`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;

	const generateMatrix = () => {
		setMatrix(cells.map(generateColor));
	};

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		const target = event.currentTarget;
		const color = target.getAttribute("data-color");

		if (color) target.style.backgroundColor = color;
		setTimeout(() => setPickedColor(color), 50); // Update picked color
	};

	useEffect(() => {
		generateMatrix(); // Initialize matrix on component mount
	}, []);

	useEffect(() => {
		if (matrix.length > 0) {
			const shuffledColors = [...matrix].sort(() => Math.random() - 0.5); // Shuffle the matrix
			const uniqueColors = Array.from(new Set(shuffledColors)); // Ensure uniqueness
			setPreview(uniqueColors.slice(0, 2)); // Pick two random unique colors
		}
	}, [matrix]);

	useEffect(() => {
		if (preview.length > 0 && matrixRef.current) {
			let children = matrixRef.current.querySelectorAll(".layout__item");
			children.forEach((element) => {
				if (element instanceof HTMLElement) element.style.backgroundColor = "white";
			});
		}
	}, [preview, matrixRef]);

	useEffect(() => {
		if (pickedColor) {
			setStats((prevStats) => ({
				...prevStats,
				corrects: preview.includes(pickedColor) ? prevStats.corrects + 1 : prevStats.corrects,
				mistakes: !preview.includes(pickedColor) ? prevStats.mistakes + 1 : prevStats.mistakes,
			}));
		}
	}, [pickedColor, preview]);

	useEffect(() => {
		const { corrects, mistakes } = stats;
		if (mistakes === 2) {
			alert("Wrong!");
			resetGame();
		} else if (corrects === 2) {
			alert("Correct!");
			resetGame();
		}
	}, [stats]);

	const resetGame = () => {
		generateMatrix();
		setStats({ corrects: 0, mistakes: 0 });
		setPickedColor(null);
	};

	return (
		<div
			ref={matrixRef}
			className="layout__group"
		>
			<div className="preview__group">
				{preview.map((color, index) => (
					<div
						key={index}
						style={{ backgroundColor: color }}
						className="preview__item"
					></div>
				))}
			</div>

			{matrix.map((color, index) => (
				<button
					key={index}
					data-color={color}
					style={{ backgroundColor: color }}
					className="layout__item"
					onClick={handleClick}
				></button>
			))}
		</div>
	);
}

export default function App() {
	return <Game />;
}
