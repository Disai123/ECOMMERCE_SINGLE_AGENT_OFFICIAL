const API_URL = "http://localhost:8000";

export const agentAPI = {
    sendMessage: async (message, sessionId, token) => {
        const response = await fetch(`${API_URL}/agent/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message,
                session_id: sessionId
            })
        });

        if (!response.ok) {
            throw new Error("Failed to send message to agent");
        }
        return response.json();
    },

    getHistory: async (sessionId, token) => {
        const response = await fetch(`${API_URL}/agent/history/${sessionId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error("Failed to fetch history");
        }
        return response.json();
    },

    getCart: async (sessionId, token) => {
        const response = await fetch(`${API_URL}/agent/cart/${sessionId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) return [];
        return response.json();
    }
};
