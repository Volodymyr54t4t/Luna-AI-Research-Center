const API_PREFIX = '/api/thermo';

const materialNames = {
    aluminum: 'Алюміній',
    plastic: 'Пластик',
    glass: 'Скло',
    insulation: 'Ізоляція'
};

const form = document.getElementById('calculatorForm');
const errorMessage = document.getElementById('errorMessage');
const resultCard = document.getElementById('resultCard');

const resultMaterial = document.getElementById('resultMaterial');
const resultCoefficient = document.getElementById('resultCoefficient');
const resultThickness = document.getElementById('resultThickness');
const resultArea = document.getElementById('resultArea');
const resultTempDiff = document.getElementById('resultTempDiff');
const resultHeatLoss = document.getElementById('resultHeatLoss');
const resultRecommendation = document.getElementById('resultRecommendation');

const experimentsTable = document.getElementById('experimentsTable');
const experimentsTableBody = document.getElementById('experimentsTableBody');
const noDataMessage = document.getElementById('noDataMessage');
const loadingMessage = document.getElementById('loadingMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    errorMessage.innerHTML = '';

    const material = document.getElementById('material').value;
    const thickness = document.getElementById('thickness').value;
    const area = document.getElementById('area').value;
    const insideTemp = document.getElementById('insideTemp').value;
    const outsideTemp = document.getElementById('outsideTemp').value;

    const errors = validateForm(material, thickness, area, insideTemp, outsideTemp);
    if (errors.length > 0) {
        showError(errors);
        return;
    }

    try {
        const response = await fetch(`${API_PREFIX}/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                material,
                thickness: parseFloat(thickness),
                area: parseFloat(area),
                insideTemp: parseFloat(insideTemp),
                outsideTemp: parseFloat(outsideTemp)
            })
        });

        const data = await response.json();

        if (!data.success) {
            showError(data.errors || [data.error || 'Невідома помилка']);
            return;
        }

        displayResult(data.result);
        await loadExperiments();

    } catch (error) {
        console.error('Помилка:', error);
        showError(['Помилка при з\'єднанні з сервером.']);
    }
});

function validateForm(material, thickness, area, insideTemp, outsideTemp) {
    const errors = [];

    if (!material) {
        errors.push('Будь ласка, виберіть матеріал');
    }

    if (!thickness || parseFloat(thickness) <= 0) {
        errors.push('Товщина повинна бути більше 0');
    }

    if (!area || parseFloat(area) <= 0) {
        errors.push('Площа повинна бути більше 0');
    }

    if (insideTemp === '' || insideTemp === null || isNaN(parseFloat(insideTemp))) {
        errors.push('Вкажіть внутрішню температуру');
    }

    if (outsideTemp === '' || outsideTemp === null || isNaN(parseFloat(outsideTemp))) {
        errors.push('Вкажіть зовнішню температуру');
    }

    return errors;
}

function showError(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    let errorHTML = '<strong>Помилка!</strong><br>';
    errors.forEach(error => {
        errorHTML += `• ${error}<br>`;
    });

    errorMessage.innerHTML = errorHTML;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function displayResult(result) {
    resultMaterial.textContent = materialNames[result.material] || result.material;
    resultCoefficient.textContent = `${result.coefficient} Вт/(м·К)`;
    resultThickness.textContent = `${result.thickness} м`;
    resultArea.textContent = `${result.area} м²`;
    
    const tempDiff = result.insideTemp - result.outsideTemp;
    resultTempDiff.textContent = `${tempDiff}°C`;
    
    resultHeatLoss.textContent = `${result.heatLoss.toFixed(2)} Вт`;
    resultRecommendation.textContent = result.recommendation;

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function loadExperiments() {
    try {
        loadingMessage.style.display = 'block';
        experimentsTable.style.display = 'none';
        noDataMessage.style.display = 'none';
        experimentsTableBody.innerHTML = '';

        const response = await fetch(`${API_PREFIX}/experiments`);
        const data = await response.json();

        loadingMessage.style.display = 'none';

        if (!data.success || !data.data || data.data.length === 0) {
            noDataMessage.style.display = 'block';
            return;
        }

        data.data.forEach((experiment, index) => {
            const row = document.createElement('tr');
            const tempDiff = experiment.inside_temp - experiment.outside_temp;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${materialNames[experiment.material] || experiment.material}</td>
                <td>${experiment.thickness}</td>
                <td>${experiment.area}</td>
                <td>${tempDiff}</td>
                <td>${experiment.coefficient}</td>
                <td>${experiment.heat_loss.toFixed(2)}</td>
                <td>${experiment.recommendation}</td>
                <td>${experiment.created_at}</td>
            `;

            experimentsTableBody.appendChild(row);
        });

        experimentsTable.style.display = 'table';

    } catch (error) {
        console.error('Помилка при завантаженні експериментів:', error);
        loadingMessage.style.display = 'none';
        noDataMessage.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadExperiments();
});

setInterval(loadExperiments, 30000);
