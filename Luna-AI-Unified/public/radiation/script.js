const API_PREFIX = '/api/radiation';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculationForm");
  const resultDiv = document.getElementById("result");
  const tbody = document.querySelector("#historyTable tbody");

  function getSafetyLevel(penetration) {
    if (penetration < 20) return { text: "✅ Безпечно", cls: "safe" };
    if (penetration <= 50) return { text: "⚠️ Середньо", cls: "medium" };
    return { text: "❌ Небезпечно", cls: "danger" };
  }

  async function loadHistory() {
    try {
      const response = await fetch(`${API_PREFIX}/experiments`);
      const experiments = await response.json();

      tbody.innerHTML = "";

      experiments.forEach((exp) => {
        const safety = getSafetyLevel(exp.penetration);
        const date = new Date(exp.created_at).toLocaleString("uk-UA", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${exp.material}</td>
                    <td>${exp.thickness}</td>
                    <td>${exp.radiation_level}</td>
                    <td>${exp.penetration.toFixed(2)}%</td>
                    <td class="${safety.cls}">${safety.text}</td>
                    <td>${date}</td>
                `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Помилка завантаження історії:", err);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const material = document.getElementById("material").value;
    const thickness = parseFloat(document.getElementById("thickness").value);
    const radiationLevel = parseFloat(document.getElementById("radiationLevel").value);

    try {
      const response = await fetch(`${API_PREFIX}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material, thickness, radiationLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        resultDiv.innerHTML = `<p style="color:#ff4444;">Помилка: ${data.error}</p>`;
        resultDiv.classList.add("show");
        return;
      }

      const safety = getSafetyLevel(data.penetration);

      resultDiv.innerHTML = `
                <h3>✅ Результати розрахунку</h3>
                <p><strong>Матеріал:</strong> ${data.material}</p>
                <p><strong>Товщина:</strong> ${data.thickness} см</p>
                <p><strong>Проникнення радіації:</strong> <strong>${data.penetration}%</strong></p>
                <p><strong>Рівень безпеки:</strong> <span class="${safety.cls}">${safety.text}</span></p>
            `;
      resultDiv.classList.add("show");

      loadHistory();
    } catch (err) {
      resultDiv.innerHTML = `<p style="color:#ff4444;">Помилка з'єднання з сервером</p>`;
      resultDiv.classList.add("show");
    }
  });

  loadHistory();
});
