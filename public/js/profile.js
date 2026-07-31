document.addEventListener('DOMContentLoaded', () => {
    fetchProfileData();
    setupAvatarUpload();
});

async function fetchProfileData() {
    try {
        const response = await fetch('/staff/api/profile');
        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            return;
        }

        renderProfile(data);
    } catch (err) {
        console.error('Failed to load profile data', err);
    }
}

function renderProfile(data) {
    // Header Info
    document.getElementById('profileName').textContent = data.staff.name;
    document.getElementById('profileDepartment').textContent = data.staff.department;

    // Avatar rendering
    updateAvatarUI(data.staff.profile_pic, data.staff.name);

    // Status Badge
    const statusBadge = document.getElementById('profileStatus');
    if (data.staff.status === 'Active') {
        statusBadge.textContent = 'Active';
        statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200';
    } else {
        statusBadge.textContent = 'Inactive';
        statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200';
    }

    // View Mode Fields
    document.getElementById('viewName').textContent = data.staff.name;
    document.getElementById('viewStaffId').textContent = `#${data.staff.staff_id}`;
    document.getElementById('viewEmail').textContent = data.staff.email;
    document.getElementById('viewDept').textContent = data.staff.department;

    // Edit Mode Fields (pre-fill)
    document.getElementById('editName').value = data.staff.name;
    document.getElementById('editEmail').value = data.staff.email;

    // Stats
    if (data.stats) {
        document.getElementById('statsPresent').textContent = data.stats.daysPresent;
        document.getElementById('statsLate').textContent = data.stats.daysLate;
        document.getElementById('statsAbsent').textContent = data.stats.daysAbsent;
    }

    // Setup Edit Toggle
    setupEditToggle();
}

function updateAvatarUI(profilePicUrl, name) {
    const avatarImg = document.getElementById('avatarImage');
    const avatarInitials = document.getElementById('avatarInitials');

    if (profilePicUrl) {
        avatarImg.src = profilePicUrl;
        avatarImg.classList.remove('hidden');
        avatarInitials.classList.add('hidden');
    } else {
        avatarImg.classList.add('hidden');
        avatarInitials.classList.remove('hidden');
        const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '--';
        avatarInitials.textContent = initials;
    }
}

function setupAvatarUpload() {
    const fileInput = document.getElementById('profilePicInput');
    const statusText = document.getElementById('uploadStatusText');

    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Instant local preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('avatarImage').src = e.target.result;
            document.getElementById('avatarImage').classList.remove('hidden');
            document.getElementById('avatarInitials').classList.add('hidden');
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append('profile_pic', file);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (statusText) {
            statusText.textContent = 'Uploading...';
            statusText.classList.remove('hidden');
        }

        try {
            const response = await fetch('/staff/api/profile/avatar', {
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                if (statusText) {
                    statusText.textContent = '✓ Saved!';
                    statusText.className = 'text-xs text-green-600 font-medium';
                    setTimeout(() => statusText.classList.add('hidden'), 3000);
                }
                updateAvatarUI(result.profile_pic);
            } else {
                alert(result.error || 'Failed to upload image.');
                if (statusText) statusText.classList.add('hidden');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload image. Please try again.');
            if (statusText) statusText.classList.add('hidden');
        }
    });
}

function setupEditToggle() {
    const btnEdit = document.getElementById('btnEdit');
    const btnSave = document.getElementById('btnSave');
    const btnCancel = document.getElementById('btnCancel');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');

    if (!btnEdit || !btnSave || !btnCancel) return;

    btnEdit.onclick = () => {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        btnEdit.classList.add('hidden');
    };

    btnCancel.onclick = () => {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
        btnEdit.classList.remove('hidden');
    };

    btnSave.onclick = async () => {
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch('/staff/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ name, email })
            });
            const data = await response.json();
            if (data.success) {
                document.getElementById('viewName').textContent = name;
                document.getElementById('viewEmail').textContent = email;
                document.getElementById('profileName').textContent = name;
                viewMode.classList.remove('hidden');
                editMode.classList.add('hidden');
                btnEdit.classList.remove('hidden');
            } else {
                alert(data.error || 'Failed to update profile.');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            alert('Error updating profile.');
        }
    };
}
