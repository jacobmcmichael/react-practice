import { useState, FormEvent, useEffect } from "react";
import "./App.css";

enum Params {
	MeansLike = "ml",
	SoundsLike = "sl",
	SpelledLike = "sp",
	Synonym = "rel_syn",
}

type FormData = {
	param: Params[keyof Params];
	term: string;
};

type Results = {
	word: string;
	score: number;
};

const paramOptions: string[] = Object.values(Params);

const SynonymResults = () => {
	const [formData, setFormData] = useState<FormData>({
		param: paramOptions[0],
		term: "",
	});

	const [results, setResults] = useState<Results[]>([]);
	const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);

	const useDebounce = (callback: CallableFunction, delay: number = 500) => {
		let timer: ReturnType<typeof setTimeout>;

		return (...args: any) => {
			clearTimeout(timer);
			setIsLoading(true);

			timer = setTimeout(() => {
				callback(...args);
				setIsLoading(false);
			}, delay);
		};
	};

	const fetchRequest = async () => {
		try {
			const URL = `https://api.datamuse.com/words?${formData.param}=${formData.term}`;

			const response: Response = await fetch(URL);
			if (!response.ok) throw new Error("Response was not ok!");

			const data: Results[] = await response.json();
			if (response) setResults(data);
		} catch (error) {
			setError("Failed to fetch results.");
			console.error(error);
		}
	};

	const debouncedRequest = useDebounce(fetchRequest);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();

		debouncedRequest();
	};

	useEffect(() => {
		if (formData.term) {
			debouncedRequest();
		}
	}, [formData.param, formData.term]);

	return (
		<>
			<form onSubmit={(event) => handleSubmit(event)}>
				<select
					className="options__group"
					defaultValue={paramOptions[0]}
					onChange={(event) => setFormData((prev: FormData) => ({ ...prev, param: event.target.value }))}
				>
					{paramOptions.map((param, index) => (
						<option
							key={index}
							value={param}
						>
							{param}
						</option>
					))}
				</select>

				<input
					type="text"
					name="term"
					placeholder="Type the word you want to find a synonym for"
					onChange={(event) => setFormData((prev: FormData) => ({ ...prev, term: event.target.value }))}
				/>
			</form>

			<ul className="results__group">
				{isLoading ? (
					<p>Loading...</p>
				) : results.length > 0 ? (
					results?.map((item: Results, index: number) => <li key={index}>{item.word}</li>)
				) : (
					error
				)}
			</ul>
		</>
	);
};

function App() {
	return (
		<>
			<SynonymResults />
		</>
	);
}

export default App;
