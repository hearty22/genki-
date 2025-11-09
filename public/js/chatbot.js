document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic-input');
    const typeInput = document.getElementById('type-select');
    const difficultyInput = document.getElementById('difficulty-select');
    const sendButton = document.getElementById('send-button');
    const chatOutput = document.getElementById('chat-output');
    const loading = document.querySelector('.loading'); // Corrected selector
    const chartCanvas = document.getElementById('type-chart'); // Corrected ID
    let chart = null;

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    sendButton.addEventListener('click', async () => {
        const topic = topicInput.value;
        const type = typeInput.value;
        const difficulty = difficultyInput.value;
        if (!topic) return;

        chatOutput.innerHTML = '';
        if (chart) {
            chart.destroy();
        }

        loading.classList.remove('hidden');

        try {
            const token = getCookie('authToken');
            const response = await fetch('/api/chatbot/generate-dynamic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic, type, difficulty })
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();

            chatOutput.innerHTML = marked.parse(data.dynamic);

            if (data.chart) {
                const ctx = chartCanvas.getContext('2d');
                chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.chart.labels,
                        datasets: [{
                            label: data.chart.title,
                            data: data.chart.data,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            chatOutput.innerHTML = `<p style="color: red;">${error.message}</p>`;
        } finally {
            loading.classList.add('hidden');
        }
    });
});