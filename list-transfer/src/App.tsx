import { LegacyRef, MouseEvent, useRef, useState } from "react";
import "./App.css";

type ListDataItem = {
	title: string;
	id: number;
	checked: boolean;
};

const Icon = ({ type }: { type: "arrow-left" | "arrow-right" }) => {
	const ArrowLeft = () => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="size-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
		);
	};

	const ArrowRight = () => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="size-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
		);
	};

	switch (type) {
		case "arrow-left":
			return <ArrowLeft />;
		case "arrow-right":
			return <ArrowRight />;
	}
};

const ListController = ({ handleListTransfer }: any) => {
	return (
		<div className="list__controller">
			<button
				data-to="left"
				onClick={(event) => handleListTransfer(event)}
			>
				<Icon type="arrow-left" />
			</button>
			<button
				data-to="right"
				onClick={(event) => handleListTransfer(event)}
			>
				<Icon type="arrow-right" />
			</button>
		</div>
	);
};

interface IListProps {
	formRef: LegacyRef<HTMLFormElement>;
	formIdentifier: string;
	data: ListDataItem[];
}

const List = ({ props }: any) => {
	const { formRef, formIdentifier, data }: IListProps = props;

	return (
		<form
			ref={formRef}
			id={formIdentifier}
			className="form__group debug"
		>
			{data.length > 0
				? data.map((item: ListDataItem) => (
						<div
							key={item.id}
							className="form__item debug"
						>
							<label htmlFor={`${formIdentifier}-${item.id}`}>{item.title}</label>
							<input
								type="checkbox"
								name={item.title}
								data-id={item.id}
								id={`${formIdentifier}-${item.id}`}
								defaultChecked={item.checked}
							/>
						</div>
					))
				: null}
		</form>
	);
};

const ListLayout = () => {
	const data: ListDataItem[] = [
		{ title: "First", id: 0, checked: false },
		{ title: "Second", id: 1, checked: false },
		{ title: "Third", id: 2, checked: false },
		{ title: "Fourth", id: 3, checked: false },
	];

	const leftFormRef = useRef<HTMLFormElement>(null);
	const rightFormRef = useRef<HTMLFormElement>(null);

	const [leftListData, setLeftListData] = useState<ListDataItem[]>(data);
	const [rightListData, setRightListData] = useState<ListDataItem[]>([]);

	const handleListTransfer = (event: MouseEvent<HTMLButtonElement>) => {
		const direction = event.currentTarget.getAttribute("data-to");

		if (direction === "left") {
			const inputs: NodeListOf<HTMLInputElement> | undefined =
				rightFormRef.current?.querySelectorAll("input:checked");

			setLeftListData((prevLeftList) => {
				let newListData: ListDataItem[] = [];

				inputs?.forEach((input: HTMLInputElement) => {
					const title: string = input.getAttribute("name") || "";
					const id: number = parseInt(input.getAttribute("data-id") || "");
					const checked: boolean = input.checked;

					const entry = { title, id, checked };

					newListData.push(entry);

					setRightListData((prevRightList) => {
						return [...prevRightList.filter((item) => item.id !== entry.id)];
					});
				});

				return [...prevLeftList, ...newListData];
			});
		} else if (direction === "right") {
			const inputs: NodeListOf<HTMLInputElement> | undefined =
				leftFormRef.current?.querySelectorAll("input:checked");

			setRightListData((prevRightList) => {
				let newListData: ListDataItem[] = [];

				inputs?.forEach((input: HTMLInputElement) => {
					const title: string = input.getAttribute("name") || "";
					const id: number = parseInt(input.getAttribute("data-id") || "");
					const checked: boolean = input.checked;

					const entry = { title, id, checked };

					newListData.push(entry);

					setLeftListData((prevLeftList) => {
						return [...prevLeftList.filter((item) => item.id !== entry.id)];
					});
				});

				return [...prevRightList, ...newListData];
			});
		}
	};

	return (
		<div className="list__layout">
			<List props={{ formRef: leftFormRef, formIdentifier: "ListA", data: leftListData }} />
			<ListController handleListTransfer={handleListTransfer} />
			<List props={{ formRef: rightFormRef, formIdentifier: "ListB", data: rightListData }} />
		</div>
	);
};

export default function App() {
	return <ListLayout />;
}
