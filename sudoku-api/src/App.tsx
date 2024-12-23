import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";

const COLUMNS: number = 9;
const ROWS: number = 9;

const cells: number[][] = Array.from(Array(COLUMNS).keys(), () =>
	Array.from(Array(ROWS).keys(), (i: number) => (i = 0)),
);

const URL: string = "https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value, solution}}}";

function Sudoku() {
	const formRef = useRef<HTMLFormElement>(null);

	const [challenge, setChallenge] = useState<number[][]>([]);
	const [attempt, setAttempt] = useState<number[][]>([]);
	const [solution, setSolution] = useState<number[][]>([]);

	const [isSolved, setIsSolved] = useState<boolean>(false);

	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchBoard = async () => {
		try {
			const response = await fetch(URL);
			if (!response.ok) throw new Error("Response was not ok!");

			setIsLoading(true);

			setTimeout(async () => {
				const data = await response.json();
				setChallenge(data.newboard.grids[0].value);
				setSolution(data.newboard.grids[0].solution);
				setAttempt(data.newboard.grids[0].value); // Initialize attempt with challenge values
			}, 500);
		} catch (error: any) {
			console.error(error);
			setError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.value.match(/[1-9]/)) return;

		let row = event.target.getAttribute("data-row");
		let column = event.target.getAttribute("data-column");

		if (row && column) {
			// Convert row and column to integers
			const rowIndex = parseInt(row, 10);
			const columnIndex = parseInt(column, 10);

			// Update the attempt matrix with the new value
			setAttempt((prev: any) => {
				const newMatrix = prev.map((r: any, rIndex: number) => {
					if (rIndex === rowIndex) {
						return r.map((c: any, cIndex: number) => {
							if (cIndex === columnIndex) {
								// Update the value in the attempt matrix
								const newValue = parseInt(event.target.value, 10) || 0; // Default to 0 if invalid input
								return newValue;
							}
							return c;
						});
					}
					return r;
				});

				return newMatrix;
			});
		}

		if (formRef.current) {
			let formInputs: NodeListOf<HTMLInputElement> = formRef.current.querySelectorAll("input:not(:disabled)");

			if (formInputs.length > 0) {
				formInputs.forEach((input, index) => {
					if (event.target === input) {
						formInputs[index + 1]?.focus();
					}
				});
			}
		}
	};

	const solve = () => {
		setAttempt(() => {
			// Deep copy of solution
			return JSON.parse(JSON.stringify(solution));
		});
		setIsSolved(true);
	};

	const reset = () => {
		setAttempt(() => {
			return JSON.parse(JSON.stringify(challenge)); // Reset to challenge state
		});
		setIsSolved(false);
	};

	// Deep comparison of attempt and solution
	const isSolvedState = JSON.stringify(attempt) === JSON.stringify(solution);

	useEffect(() => {
		fetchBoard();
	}, []);

	return (
		<>
			<form
				ref={formRef}
				className={`board ${isSolvedState ? "solved" : ""} ${isLoading ? "loading" : ""}`.trim()}
			>
				{!isLoading ? (
					attempt.length > 0 ? (
						attempt.map((row: any, rowIndex: number) =>
							row.map((value: number, colIndex: number) => (
								<input
									key={`${rowIndex}-${colIndex}`}
									data-row={rowIndex}
									data-column={colIndex}
									className={`cell ${(colIndex + 1) % 3 === 0 ? "border--right" : ""} ${(rowIndex + 1) % 3 === 0 ? "border--bottom" : ""}`}
									value={value !== 0 ? value : ""} // Display value or empty string for 0
									type="number"
									inputMode="numeric"
									pattern="[1-9]"
									min="1"
									max="9"
									onInput={(event: any) => (event.target.value = event.target.value.slice(0, 1))}
									onChange={handleChange}
									required
									disabled={challenge[rowIndex][colIndex] !== 0} // Disable if it's a pre-filled cell from the challenge
								/>
							)),
						)
					) : (
						<div>No board data</div>
					)
				) : error ? (
					<div>{error.message}</div>
				) : (
					cells.map((row) =>
						row.map((value: number, index: number) => (
							<div
								key={index}
								className="cell"
							>
								{value}
							</div>
						)),
					)
				)}
			</form>

			<button onClick={solve}>Solve</button>
			<button onClick={reset}>Reset</button>
		</>
	);
}

export default function App() {
	return (
		<>
			<Sudoku />
		</>
	);
}
