const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        // Do not throw here if you want to handle it silently, 
        // but typically you want to throw so the UI can react.
    }

    const body = await response.json().catch(() => ({}));

    if (!response.ok || (body.status === 'error')) {
        throw new Error(body.message || response.statusText || 'An error occurred');
    }

    return body;
};

const extractData = (payload: any) => {
    if (payload && Array.isArray(payload)) return payload;
    if (payload && payload.data && Array.isArray(payload.data)) return payload.data;
    if (payload && payload.data && typeof payload.data === 'object') return payload.data;
    return payload;
};

const getHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const mapMemberFromApi = (item: any) => ({
    id: String(item.id),
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    nationalId: item.national_id || '',
    email: item.email || '',
    phone: item.phone || '',
    status: item.status || 'ACTIVE',
    department: item.department || '',
    registrationDate: item.created_at || new Date().toISOString(),
    baptismDate: item.baptism_date || '',
    previousChurch: item.previous_church || '',
    destinationChurch: item.destination_church || '',
    transferDate: item.transfer_date || '',
    boardApprovalDate: item.board_approval_date || '',
    address: item.address || '',
    notes: item.notes || '',
});

const mapMemberToApi = (item: any) => ({
    id: item.id,
    first_name: item.firstName,
    last_name: item.lastName,
    national_id: item.nationalId,
    email: item.email,
    phone: item.phone,
    status: item.status,
    department: item.department,
    baptism_date: item.baptismDate || null,
    previous_church: item.previousChurch || null,
    destination_church: item.destinationChurch || null,
    transfer_date: item.transferDate || null,
    board_approval_date: item.boardApprovalDate || null,
    address: item.address,
    notes: item.notes || null,
});

export const api = {
    auth: {
        login: async (credentials: any) => {
            const data = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            }).then(handleResponse);

            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            return data;
        },
        logout: async () => {
            localStorage.removeItem('token');
        },
        me: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse).then(extractData),
    },
    members: {
        getAll: () => fetch(`${API_URL}/members`, { headers: getHeaders() }).then(handleResponse).then((payload) => {
            const items = extractData(payload);
            return Array.isArray(items) ? items.map(mapMemberFromApi) : [];
        }),
        create: (data: any) => fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(mapMemberToApi(data)),
        }).then(handleResponse),
        update: (id: string, data: any) => fetch(`${API_URL}/members/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(mapMemberToApi(data)),
        }).then(handleResponse),
        delete: (id: string) => fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(handleResponse),
        qr: (id: string) => `${API_URL}/members/qr?id=${id}`,
    },
    youth: {
        getAll: () => fetch(`${API_URL}/youth`, { headers: getHeaders() }).then(handleResponse).then(extractData),
        create: (data: any) => fetch(`${API_URL}/youth`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    },
    society: {
        getAll: () => fetch(`${API_URL}/society`, { headers: getHeaders() }).then(handleResponse).then(extractData),
        create: (data: any) => fetch(`${API_URL}/society`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    },
    users: {
        getAll: () => fetch(`${API_URL}/users`, { headers: getHeaders() }).then(handleResponse).then(extractData),
        create: (data: any) => fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
        delete: (id: string) => fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(handleResponse),
    },
    logs: {
        getAll: () => fetch(`${API_URL}/logs`, { headers: getHeaders() }).then(handleResponse).then(extractData),
        create: (data: any) => fetch(`${API_URL}/logs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    },
    attendance: {
        getAll: () => fetch(`${API_URL}/attendance`, { headers: getHeaders() }).then(handleResponse).then(extractData),
        create: (data: any) => fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
        scan: (data: any) => fetch(`${API_URL}/attendance/scan`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    },
    reports: {
        getUrl: (type: 'members' | 'youth' | 'societies' | 'attendance', format: 'pdf' | 'xlsx') => `${API_URL}/reports/generate?type=${type}&format=${format}`,
    },
    search: {
        global: (q: string) => fetch(`${API_URL}/search/global?q=${encodeURIComponent(q)}`, { headers: getHeaders() }).then(handleResponse).then(extractData),
    },
};


