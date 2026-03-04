const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? `https://api.magwegwewestsda.co.zw/api/v1` : 'http://localhost:8000/api/v1');

const handleResponse = async (response: Response) => {
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(body.message || response.statusText || 'An error occurred');
    }

    return body;
};

const extractData = (payload: any) => {
    if (payload && Array.isArray(payload.data)) return payload.data;
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

const mapYouthFromApi = (item: any) => ({
    id: String(item.id),
    firstName: item.member?.first_name || '',
    lastName: item.member?.last_name || '',
    dob: item.member?.date_of_birth || '',
    parentName: item.guardian_name || '',
    parentPhone: item.guardian_phone || '',
    grade: item.grade || '',
    club: item.club || 'PATHFINDER',
    rank: item.rank || '',
    healthNotes: item.health_notes || '',
    registrationDate: item.created_at || new Date().toISOString(),
});

const mapYouthToApi = (item: any) => ({
    first_name: item.firstName,
    last_name: item.lastName,
    guardian_name: item.parentName,
    guardian_phone: item.parentPhone,
    grade: item.grade,
    club: item.club,
    rank: item.rank,
    health_notes: item.healthNotes,
    school: item.school || '',
});

const mapUserFromApi = (item: any) => ({
    id: String(item.id),
    name: item.name,
    email: item.email,
    role: item.role,
    lastLogin: item.last_login || 'Never',
});

const mapLogFromApi = (item: any) => ({
    id: String(item.id),
    timestamp: item.created_at,
    userId: String(item.user_id || ''),
    userName: item.user?.name || 'System',
    action: item.action,
    details: `${item.entity_type || ''} ${item.entity_id || ''}`.trim(),
});

const mapAttendanceFromApi = (item: any) => ({
    id: String(item.id),
    memberId: String(item.member_id),
    memberName: item.member ? `${item.member.first_name} ${item.member.last_name}` : '',
    eventType: item.event_type,
    date: item.date,
    status: item.status,
});

export const api = {
    auth: {
        login: async (credentials: any) => {
            const data = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            }).then(handleResponse);

            localStorage.setItem('token', data.data.token);
            return data.data;
        },
        logout: async () => {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: getHeaders(),
            }).catch(() => null);
            localStorage.removeItem('token');
        },
        me: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse).then(extractData),
    },
    members: {
        getAll: () => fetch(`${API_URL}/members?perPage=1000`, { headers: getHeaders() }).then(handleResponse).then((payload) => payload.data.map(mapMemberFromApi)),
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
        qr: (id: string) => `${API_URL}/members/${id}/qr`,
    },
    youth: {
        getAll: () => fetch(`${API_URL}/youth?perPage=1000`, { headers: getHeaders() }).then(handleResponse).then((payload) => payload.data.map(mapYouthFromApi)),
        create: (data: any) => fetch(`${API_URL}/youth`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(mapYouthToApi(data)),
        }).then(handleResponse),
    },
    society: {
        getAll: () => fetch(`${API_URL}/societies?members=1`, { headers: getHeaders() }).then(handleResponse).then((payload) => payload.data),
        create: (data: any) => fetch(`${API_URL}/societies`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                first_name: data.firstName,
                last_name: data.lastName,
                national_id: data.nationalId,
                phone: data.phone,
                type: data.type,
                skills: data.skills,
            }),
        }).then(handleResponse),
    },
    users: {
        getAll: () => fetch(`${API_URL}/users?perPage=1000`, { headers: getHeaders() }).then(handleResponse).then((payload) => payload.data.map(mapUserFromApi)),
        create: (data: any) => fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                role: data.role,
                password: data.password,
            }),
        }).then(handleResponse),
        delete: (id: string) => fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(handleResponse),
    },
    logs: {
        getAll: () => fetch(`${API_URL}/audit-logs?perPage=1000`, { headers: getHeaders() }).then(handleResponse).then((payload) => payload.data.map(mapLogFromApi)),
        create: (data: any) => fetch(`${API_URL}/audit-logs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    },
    attendance: {
        getAll: () => fetch(`${API_URL}/attendance?perPage=1000`, { headers: getHeaders() }).then(handleResponse).then((payload) => payload.data.map(mapAttendanceFromApi)),
        create: (data: any) => fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                member_id: Number(data.memberId),
                event_type: data.eventType,
                date: data.date,
                status: data.status || 'Present',
            }),
        }).then(handleResponse),
        scan: (data: any) => fetch(`${API_URL}/attendance/scan`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    },
    reports: {
        getUrl: (type: 'members' | 'youth' | 'societies' | 'attendance', format: 'pdf' | 'xlsx') => `${API_URL}/reports/${type}?format=${format}`,
    },
    search: {
        global: (q: string) => fetch(`${API_URL}/search/global?q=${encodeURIComponent(q)}`, { headers: getHeaders() }).then(handleResponse).then(extractData),
    },
    notifications: {
        sendSms: (payload: { recipient: string; message: string }) => fetch(`${API_URL}/notifications/sms`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        }).then(handleResponse),
    },
    analytics: {
        insights: (query: string) => fetch(`${API_URL}/analytics/insights`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ query }),
        }).then(handleResponse).then(extractData),
    },
};


