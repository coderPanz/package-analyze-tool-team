interface LinksInfoItem {
	source: string;
	target: string;
}

interface PackageJsonType<T = any> {
	[key: string]: string | PackageJsonType[] | PackageJsonType | T;
}

interface IsVisitType {
	[key: string]: boolean;
}

interface DirectDependenciesType {
	[key: string]: string;
}

interface tmpObjType {
	packageName: string;
	version: string;
	depth: number;
	dependencies: any;
}

interface categoriesItem {
	name: string;
}

interface NodesInfoItem {
	name: string;
	value: string;
	category: string;
	symbolSize: number;
}
export type {
	LinksInfoItem,
	PackageJsonType,
	IsVisitType,
	DirectDependenciesType,
	tmpObjType,
	categoriesItem,
	NodesInfoItem,
};
