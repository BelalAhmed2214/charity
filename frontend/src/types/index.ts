export interface User {
	id: number;
	name: string;
	phone: string;
	email: string;
	role?: string;
	created_at: string;
	updated_at: string;
}

export interface Patient {
	id: number;
	user_id: number;
	name: string;
	age: number;
	ssn: string;
	phone: string;
	martial_status: string;
	status: string;
	children: number;
	governorate: string;
	address: string;
	diagnosis: string;
	solution: string;
	created_at: string;
	updated_at: string;
	user?: User;
}
