const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadStats();
    loadApplications();
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

function checkAdminAuth() {
    const token = localStorage.getItem('fame_token');
    const email = localStorage.getItem('fame_email');
    const role = localStorage.getItem('fame_role');
    
    if (!token || !email || (role !== 'admin' && email !== 'uesxa225@gmail.com')) {
        alert('Доступ запрещен!');
        window.location.href = 'index.html';
    }
}

async function loadStats() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'get_stats'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('stat-pending').textContent = result.pending_apps;
            document.getElementById('stat-rejected').textContent = result.rejected_apps;
            document.getElementById('stat-accepted').textContent = result.accepted_apps;
            document.getElementById('stat-members').textContent = result.total_members;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadApplications() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'get_applications',
                status: 'pending'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const container = document.getElementById('applications-container');
            container.innerHTML = '';
            
            result.applications.forEach(app => {
                const appElement = document.createElement('div');
                appElement.className = 'application-item';
                appElement.innerHTML = `
                    <h3>${app.nickname} (${app.username})</h3>
                    <p><strong>Email:</strong> ${app.email}</p>
                    <p><strong>Аватар:</strong> ${app.avatar}</p>
                    <p><strong>Проект:</strong> ${app.project || 'Не указан'}</p>
                    <p><strong>Описание:</strong> ${app.description || 'Нет описания'}</p>
                    ${app.extra_links ? `<p><strong>Доп. ссылки:</strong> ${JSON.parse(app.extra_links).join(', ')}</p>` : ''}
                    <p><strong>Дата подачи:</strong> ${new Date(app.created_at).toLocaleDateString('ru-RU')}</p>
                    <div class="application-actions">
                        <button class="action-btn accept" onclick="handleApplication('${app.id}', 'accepted')">Принять</button>
                        <button class="action-btn reject" onclick="handleApplication('${app.id}', 'rejected')">Отклонить</button>
                    </div>
                `;
                container.appendChild(appElement);
            });
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

async function handleApplication(appId, status) {
    const email = localStorage.getItem('fame_email');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'update_application',
                app_id: appId,
                status: status,
                reviewer_email: email
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Заявка обновлена!');
            loadStats();
            loadApplications();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error handling application:', error);
        alert('Ошибка сети');
    }
}