/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import crypto from 'crypto';

type InfoData = {
	name: string;
	length: number;
	creation: string;
	upload: string;
	tags: string;
	description: string;
};

type InfoUsage = {
	duration: number;
	views: number;
	peruser: number;
	likes: number;
	favs: number;
	feedbacks: number;
};
export class Err {
	code: number;
	message: string;

	constructor(code: number, message: string) {
		this.code = code;
		this.message = message;
	}

	clone(): Err {
		return new Err(this.code, this.message);
	}
}

type ChartData = {
	data: Array<{ day: string; value: unknown }>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getDescription(id: string, content: string): Promise<any> {
	return axios
		.get(`/api/admin/${content}?${id}`)
		.then((response) => {
			if (response.status === 200) {
				const data: InfoData = response.data;
				const packedData: Array<{ name: string; value: unknown }> =
					PackInfoData(data);
				return packedData;
			} else if (response.status === 404) {
				throw 'Datele cerute nu sunt disponibile!';
			} else if (response.status === 401) {
				throw 'Nu suntenti autentificat in sistem!';
			} else if (response.status === 403) {
				throw 'Accesul interzis! Nu aveti drepturi autorizate asupra acestor date!';
			}
		})
		.catch((err) => {
			throw err;
		});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUsage(id: string, content: string): Promise<any> {
	return axios
		.get(`/api/admin/${content}?${id}`)
		.then((response) => {
			if (response.status === 200) {
				const data: InfoUsage = response.data;
				const packedData: Array<{ name: string; value: unknown }> =
					PackUsageData(data);
				return packedData;
			} else if (response.status === 404) {
				throw 'Datele cerute nu sunt disponibile!';
			} else if (response.status === 401) {
				throw 'Nu suntenti autentificat in sistem!';
			} else if (response.status === 403) {
				throw 'Accesul interzis! Nu aveti drepturi autorizate asupra acestor date!';
			}
		})
		.catch((err) => {
			throw err;
		});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getChartData(
	content: string,
	year: string,
	month: string,
	day?: string,
): Promise<any> {
	let subpath = `/api/admin/statistics/${content}?year=${year}&month=${month}`;

	if (day != '') {
		subpath += `&day=${day}`;
	}

	return axios
		.get(subpath)
		.then((response) => {
			if (response.status === 200) {
				const data: ChartData = response.data;
				return data;
			} else if (response.status === 404) {
				throw 'Datele cerute nu sunt disponibile!';
			} else if (response.status === 401) {
				throw 'Nu suntenti autentificat in sistem!';
			} else if (response.status === 403) {
				throw 'Accesul interzis! Nu aveti drepturi autorizate asupra acestor date!';
			}
		})
		.catch((err) => {
			throw err;
		});
}

function PackInfoData(data: InfoData): Array<{ name: string; value: unknown }> {
	let pack: Array<{ name: string; value: unknown }>;
	pack.push({ name: 'Nume', value: data['name'] });
	pack.push({ name: 'Lungime', value: data['length'] });
	pack.push({ name: 'Data creare', value: data['creation'] });
	pack.push({ name: 'Data incarcare', value: data['upload'] });
	pack.push({ name: 'Tags', value: data['tags'] });
	pack.push({ name: 'Descriere', value: data['description'] });

	return pack;
}

function PackUsageData(
	data: InfoUsage,
): Array<{ name: string; value: unknown }> {
	let pack: Array<{ name: string; value: unknown }>;
	pack.push({ name: 'Total durata vizionari', value: data['duration'] });
	pack.push({ name: 'Total vizionari', value: data['views'] });
	pack.push({ name: 'Durata per utilizator', value: data['peruser'] });
	pack.push({ name: 'Aprecieri', value: data['likes'] });
	pack.push({ name: 'Favorizari', value: data['favs'] });
	pack.push({ name: 'Feedback-uri', value: data['feedbacks'] });

	return pack;
}

export const ResponseCodes = new Map([
	[200, 'Cererea a fost efectuata cu succes.'],
	[201, 'Resursa a fost creata.'],
	[202, 'Cererea a fost acceptata si urmeaza sa fie procesata.'],
	[400, 'Cererea trimisa este invalida.'],
	[401, 'Nu esti autorizat in sistem.'],
	[403, 'Nu ai drepturi pentru a accesa resursa ceruta.'],
	[404, 'Resursa ceruta nu a fost gasita.'],
	[405, 'Metoda pentru aceasta cerere nu este permisa.'],
	[408, 'Timpul de asteptare pentru cererea trimisa a expirat.'],
	[413, 'Cererea trimisa are o dimensiune prea mare.'],
	[415, 'Formatul multimedia nu este suportat.'],
	[500, 'A intervenit o eroare interna in server.'],
	[501, 'Metoda cererii trimisa nu este suportata de catre acest server.'],
	[
		503,
		'Serviciul cerut nu este disponibil. Serverul este in mentenanta sau indisponibil in momentul de fata.',
	],
	[
		507,
		'Serverul nu mai are spatiu de stocare suficient pentru a inregistra resursa dorita.',
	],
]);

const algorithm = 'aes-256-ctr';
const secretKey = 'S948vjpAirnvGp20S948vjpAirnvGp20';
export const iv = crypto.randomBytes(16);

export const encrypt = (text: string): string => {
	const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
	return encrypted.toString('hex');
};

export function watchToken(counter: number): void {
	setTimeout(() => {
		/**/
	}, counter);
}
