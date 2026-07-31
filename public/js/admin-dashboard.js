document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    fetchStats();
    initCharts();
    setupEventHandlers();
});

// --- State ---
let charts = {
    overview: null,
    lateness: null,
    punctuality: null
};

// --- Clock ---
function updateClock() {
    const now = new Date();
    const liveClock = document.getElementById('liveClock');
    const liveDate = document.getElementById('liveDate');

    if (liveClock) liveClock.textContent = now.toLocaleTimeString();
    if (liveDate) liveDate.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// --- Stats & Charts ---
async function fetchStats() {
    try {
        const response = await fetch('/admin/api/stats');
        const data = await response.json();

        // Update Text Stats
        document.getElementById('statTotalStaff').textContent = data.totalStaff || 0;
        document.getElementById('statPresent').textContent = data.present || 0;
        document.getElementById('statLate').textContent = data.late || 0;
        document.getElementById('statAbsent').textContent = data.absent || 0;

    } catch (err) {
        console.error("Failed to fetch stats", err);
    }
}

async function initCharts() {
    try {
        // 1. Overview (Pie)
        const statsRes = await fetch('/admin/api/stats/overview');
        const statsData = await statsRes.json();
        const ctxOverview = document.getElementById('overviewChart').getContext('2d');

        // Prepare data for pie
        // statsData is { Present: X, Late: Y, Absent: Z }
        charts.overview = new Chart(ctxOverview, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Late', 'Absent'],
                datasets: [{
                    data: [
                        statsData.Present || statsData.present || 0,
                        statsData.Late || statsData.late || 0,
                        statsData.Absent || statsData.absent || 0
                    ],
                    backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // 2. Lateness Trend (Bar)
        const latenessRes = await fetch('/admin/api/stats/lateness');
        const latenessData = await latenessRes.json();
        // format: [{date: '...', count: 5}, ...]
        const ctxLateness = document.getElementById('latenessChart').getContext('2d');

        charts.lateness = new Chart(ctxLateness, {
            type: 'bar',
            data: {
                labels: latenessData.map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })),
                datasets: [{
                    label: 'Late Staff',
                    data: latenessData.map(d => d.count),
                    backgroundColor: '#d97706',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });

        // 3. Punctuality Trend (Line)
        const punctRes = await fetch('/admin/api/stats/punctuality');
        const punctData = await punctRes.json();
        const ctxPunct = document.getElementById('punctualityChart').getContext('2d');

        charts.punctuality = new Chart(ctxPunct, {
            type: 'line',
            data: {
                labels: punctData.map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })),
                datasets: [{
                    label: 'On Time',
                    data: punctData.map(d => d.count),
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });

    } catch (err) {
        console.error("Chart init failed", err);
    }
}


// --- Drill Down ---
function setupEventHandlers() {
    // Card Clicks
    ['Present', 'Late', 'Absent'].forEach(status => {
        const card = document.getElementById(`card${status}`);
        if (card) {
            card.addEventListener('click', () => openDrillDown(status));
        }
    });

    // Modal Close
    document.getElementById('closeModalBtn').addEventListener('click', closeDrillDown);
    document.getElementById('drillDownModal').addEventListener('click', (e) => {
        if (e.target.id === 'drillDownModal') closeDrillDown();
    });

    // Chat
    document.getElementById('aiChatToggle').addEventListener('click', toggleChat);
    document.getElementById('closeChatBtn').addEventListener('click', toggleChat);
    document.getElementById('chatForm').addEventListener('submit', handleChatSubmit);

    // Mobile Sidebar
    const openSidebar = document.getElementById('openSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (openSidebar && sidebar && overlay) {
        openSidebar.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            requestAnimationFrame(() => {
                overlay.classList.remove('opacity-0');
                sidebar.classList.remove('-translate-x-full');
            });
        });

        const hideSidebar = () => {
            overlay.classList.add('opacity-0');
            sidebar.classList.add('-translate-x-full');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        };

        if (closeSidebar) closeSidebar.addEventListener('click', hideSidebar);
        overlay.addEventListener('click', hideSidebar);
    }
}

async function openDrillDown(status) {
    const modal = document.getElementById('drillDownModal');
    const title = document.getElementById('modalTitle');
    const tbody = document.getElementById('modalTableBody');

    title.textContent = `${status} Staff Details`;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>';

    // Show Modal
    modal.classList.remove('hidden');
    // small delay for transition
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.children[0].classList.remove('scale-95');
        modal.children[0].classList.add('scale-100');
    });

    try {
        const res = await fetch(`/admin/api/staff/drilldown?type=${status}`);
        const data = await res.json();

        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-slate-500">No records found.</td></tr>';
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${row.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${row.department || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${row.check_in_time || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${status === 'Present' ? 'bg-green-100 text-green-800' :
                    status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}">
                        ${status}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
    }
}

function closeDrillDown() {
    const modal = document.getElementById('drillDownModal');
    modal.classList.add('opacity-0');
    modal.children[0].classList.remove('scale-100');
    modal.children[0].classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}


// --- AI Chatbot ---
function toggleChat() {
    const win = document.getElementById('aiChatWindow');
    if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        requestAnimationFrame(() => win.classList.remove('opacity-0'));
        document.getElementById('chatInput').focus();
    } else {
        win.classList.add('opacity-0');
        setTimeout(() => win.classList.add('hidden'), 300);
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    // Append User Message
    appendMessage(msg, 'user');
    input.value = '';

    // Typing...
    const typingId = appendMessage('Processing...', 'bot', true);

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await fetch('/admin/api/chat/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ query: msg })
        });
        const data = await response.json();

        // Remove typing
        document.getElementById(typingId).remove();

        if (data.type === 'data_list' && Array.isArray(data.data)) {
            let html = `${data.text}<ul class="mt-2 list-disc list-inside space-y-1 text-xs">`;
            data.data.forEach(item => {
                html += `<li><b>${item.name}</b> (${item.department}) ${item.check_in_time ? '- ' + item.check_in_time : ''}</li>`;
            });
            html += `</ul>`;
            appendMessage(html, 'bot', false, true);
        } else {
            appendMessage(data.text, 'bot');
        }

    } catch (err) {
        console.error(err);
        document.getElementById(typingId).remove();
        appendMessage("Sorry, I encountered an error.", 'bot');
    }
}

function appendMessage(text, sender, isTyping = false, isHtml = false) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    const id = 'msg-' + Date.now();
    div.id = id;

    div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

    let contentClass = sender === 'user'
        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
        : 'bg-white border border-slate-200 rounded-2xl rounded-tl-none text-slate-700';

    div.innerHTML = `
        <div class="${contentClass} py-2 px-3 max-w-[80%] shadow-sm text-sm">
            ${isHtml ? text : escapeHtml(text)}
        </div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
