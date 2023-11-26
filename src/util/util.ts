import { List } from "./types";
import { useState, useEffect } from "react";

export function findListFromName(id: string, listData: List[] | undefined) {
	if (!listData) {
		return;
	}

	const list = listData.find((list) => {
		return list.name == id;
	});

	if (!list) {
		return;
	}

	return list;
}

// https://github.com/tailwindlabs/headlessui/discussions/820
export const idiotsAtHeadlessUI = (e: {
	code: string;
	stopPropagation: () => void;
}) => {
	if (e.code === "Space") {
		e.stopPropagation();
	}
};

// @ts-expect-error typing has no value
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function useEpics(filtered = true) {
	// TODO replace with dixie
	// const { data, error, isLoading } = useSWR(
	// 	`/api/task/get/epics?filtered=${filtered ? "true" : "false"}`,
	// 	fetcher
	// );

	return {
		data: {} as any,
		isLoading: false,
		isError: {} as any,
	};
}

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height,
	};
}

export default function useWindowDimensions() {
	const [windowDimensions, setWindowDimensions] = useState(
		getWindowDimensions()
	);

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowDimensions;
}
