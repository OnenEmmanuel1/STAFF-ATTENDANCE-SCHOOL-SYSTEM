document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    updateGreeting();
    fetchDashboardData();
    fetchNotifications();
});

// Update live clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('liveClock').textContent = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString(undefined, options);
}

// Update greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';

    if (hour < 12) {
        greeting = 'Good Morning';
    } else if (hour < 18) {
        greeting = 'Good Afternoon';
    }

    document.getElementById('greeting').textContent = greeting;
}

// Fetch content
async function fetchNotifications() {
    try {
        const res = await fetch('/staff/api/notifications');
        const notifications = await res.json();

        const list = document.getElementById('notificationList');
        const section = document.getElementById('notificationSection');

        if (notifications.length > 0) {
            section.classList.remove('hidden');
            list.innerHTML = '';

            notifications.forEach(n => {
                const div = document.createElement('div');
                div.className = `p-4 rounded-xl border ${n.title.includes('Sanction') ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`;

                div.innerHTML = `
                    <div class="flex justify-between items-start">
                        <h4 class="font-medium ${n.title.includes('Sanction') ? 'text-red-800' : 'text-slate-800'}">${n.title}</h4>
                        <span class="text-xs text-slate-400">${new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm ${n.title.includes('Sanction') ? 'text-red-600' : 'text-slate-600'} mt-1">${n.message}</p>
                `;
                list.appendChild(div);
            });
        }
    } catch (e) {
        console.error("Failed to load notifications", e);
    }
}

// Fetch dashboard data
async function fetchDashboardData() {
    try {
        const response = await fetch('/staff/api/dashboard');
        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            return;
        }

        renderDashboard(data);
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    }
}

// Render dashboard
function renderDashboard(data) {
    // Staff Info
    document.getElementById('staffName').textContent = data.staff.name;
    document.getElementById('staffDepartment').textContent = data.staff.department;

    const img = document.getElementById('dashAvatarImg');
    const icon = document.getElementById('dashAvatarIcon');
    const initials = document.getElementById('dashAvatarInitials');

    if (data.staff && data.staff.profile_pic) {
        if (img) {
            img.src = data.staff.profile_pic;
            img.classList.remove('hidden');
        }
        if (icon) icon.classList.add('hidden');
        if (initials) initials.classList.add('hidden');
    } else if (data.staff && data.staff.name) {
        const userInitials = data.staff.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        if (initials) {
            initials.textContent = userInitials;
            initials.classList.remove('hidden');
        }
        if (icon) icon.classList.add('hidden');
        if (img) img.classList.add('hidden');
    }

    // Stats
    if (data.stats) {
        document.getElementById('statPresent').textContent = data.stats.daysPresent;
        document.getElementById('statLate').textContent = data.stats.daysLate;
        document.getElementById('statAbsent').textContent = data.stats.daysAbsent;

        const lastCheckIn = data.stats.lastCheckIn !== 'N/A' ? data.stats.lastCheckIn.substring(0, 5) : '--:--';
        document.getElementById('statLastCheckIn').textContent = lastCheckIn;
    }

    // Status
    const statusBadge = document.getElementById('statusBadge');
    const statusAnimation = document.getElementById('statusAnimation');
    const statusMessage = document.getElementById('statusMessage');
    const btnCheckIn = document.getElementById('btnCheckIn');
    const btnCheckOut = document.getElementById('btnCheckOut');

    if (data.status === 'Checked In') {
        statusBadge.textContent = '✓ Checked In';
        statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200';
        statusAnimation.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
        statusMessage.textContent = 'You are currently checked in. Don\'t forget to check out!';

        btnCheckIn.disabled = true;
        btnCheckIn.textContent = '✓ Already Checked In';
        btnCheckOut.disabled = false;

    } else if (data.status === 'Checked Out') {
        statusBadge.textContent = 'Completed for Today';
        statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200';
        statusAnimation.className = 'w-2 h-2 rounded-full bg-slate-400';
        statusMessage.textContent = 'You have successfully completed your attendance for today.';

        btnCheckIn.disabled = true;
        btnCheckOut.disabled = true;
        btnCheckOut.textContent = '✓ Checked Out';

    } else {
        // Not Checked In
        btnCheckIn.disabled = false;
        btnCheckOut.disabled = true;

        if (data.window && !data.window.isOpen) {
            // Window Closed - Alert but allow
            statusBadge.textContent = 'Window Closed';
            statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100';
            statusAnimation.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
            statusMessage.textContent = `Work hours are ${data.window.start} to ${data.window.end}, but you can still mark your attendance now.`;

            btnCheckIn.disabled = false;
            btnCheckIn.textContent = 'Check In Anyway';
            btnCheckIn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            // Window Open
            statusBadge.textContent = 'Not Checked In';
            statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100';
            statusAnimation.className = 'w-2 h-2 rounded-full bg-indigo-500 animate-pulse';
            statusMessage.textContent = 'Please check in to mark your attendance.';

            btnCheckIn.disabled = false;
            btnCheckIn.textContent = 'Check In';
            btnCheckIn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // Attach Event Listeners
    btnCheckIn.onclick = handleCheckIn;
    btnCheckOut.onclick = handleCheckOut;

    // History
    renderHistory(data.history);
}

// Render history table
function renderHistory(history) {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (!history || history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-16 text-center">
                    <div class="flex flex-col items-center justify-center">
                        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p class="text-slate-400 text-sm">No attendance records found</p>
                        <p class="text-slate-300 text-xs mt-1">Check in to create your first record</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    history.slice(0, 30).forEach((record, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors';
        row.style.animationDelay = `${index * 0.05}s`;

        const checkIn = record.check_in_time ? record.check_in_time.substring(0, 5) : '--:--';
        const checkOut = record.check_out_time ? record.check_out_time.substring(0, 5) : '--:--';
        const date = new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

        let statusColor = 'bg-slate-100 text-slate-800';
        let statusIcon = '';

        if (record.status === 'Present') {
            statusColor = 'bg-green-100 text-green-800 border border-green-200';
            statusIcon = '✓';
        } else if (record.status === 'Late') {
            statusColor = 'bg-amber-100 text-amber-800 border border-amber-200';
            statusIcon = '⏰';
        } else if (record.status === 'Absent') {
            statusColor = 'bg-red-100 text-red-800 border border-red-200';
            statusIcon = '✕';
        }

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-slate-900">${date}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-900">${checkIn}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-900">${checkOut}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                    ${statusIcon} ${record.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Handle check-in
async function handleCheckIn() {
    if (!navigator.onLine) {
        showActionMessage('✕ You are offline. Please check your internet connection.', 'error');
        return;
    }

    const btn = document.getElementById('btnCheckIn');
    const msg = document.getElementById('actionMessage');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await fetch('/staff/check-in', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrfToken }
        });
        const data = await response.json();

        if (response.ok) {
            showActionMessage('✓ Successfully checked in! Welcome to work.', 'success');
            setTimeout(() => {
                fetchDashboardData();
            }, 2000);
        } else {
            showActionMessage('✕ ' + (data.error || 'Check-in failed'), 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    } catch (e) {
        console.error(e);
        showActionMessage('✕ Network error. Retrying once...', 'error');
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// Handle check-out
async function handleCheckOut() {
    if (!navigator.onLine) {
        showActionMessage('✕ You are offline. Please check your internet connection.', 'error');
        return;
    }

    const btn = document.getElementById('btnCheckOut');
    const msg = document.getElementById('actionMessage');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await fetch('/staff/check-out', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrfToken }
        });
        const data = await response.json();

        if (response.ok) {
            showActionMessage('✓ Successfully checked out! Have a great day.', 'success');
            setTimeout(() => {
                fetchDashboardData();
            }, 2000);
        } else {
            showActionMessage('✕ ' + (data.error || 'Check-out failed'), 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    } catch (e) {
        console.error(e);
        showActionMessage('✕ Network error. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// Utility to show messages
function showActionMessage(message, type) {
    const msg = document.getElementById('actionMessage');
    msg.textContent = message;

    if (type === 'success') {
        msg.className = 'mt-4 p-4 rounded-2xl text-sm text-center font-medium bg-green-50 text-green-700 border border-green-200 block animate-scale-in';
    } else if (type === 'error') {
        msg.className = 'mt-4 p-4 rounded-2xl text-sm text-center font-medium bg-red-50 text-red-700 border border-red-200 block';
    } else {
        msg.className = 'mt-4 p-4 rounded-2xl text-sm text-center font-medium bg-blue-50 text-blue-700 border border-blue-200 block';
    }

    setTimeout(() => msg.className = 'hidden', 3000);
}
