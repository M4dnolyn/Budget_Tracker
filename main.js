//  Vérification de connexion

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "index.html";
}

//  Sélection des éléments

const expenseTableBody = document.querySelector("#expense-table tbody");
const totalDisplay = document.getElementById("total");
const clearAllBtn = document.getElementById("clearAll");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("filter-category");
const dateFilter = document.getElementById("filter-date");
const addBtn = document.getElementById("addExpenseBtn");

//  Gestion des données utilisateur

let allData = JSON.parse(localStorage.getItem("expensesData")) || {};
let userExpenses = allData[currentUser.email] || [];

//  Initialisation du graphique

let chart;
let chartInitialized = false;

function updateChart() {
  // Vérifier si le canvas existe
  const canvas = document.getElementById("statsChart");
  if (!canvas) return;

  // Créer le contexte seulement une fois
  if (!chartInitialized) {
    chartInitialized = true;
  }

  const ctx = canvas.getContext("2d");

  const categories = {};
  userExpenses.forEach((exp) => {
    categories[exp.category] =
      (categories[exp.category] || 0) + parseFloat(exp.amount);
  });

  // Si aucune catégorie, afficher un graphique vide avec message

  if (Object.keys(categories).length === 0) {
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Aucune dépense"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["rgba(200, 200, 200, 0.3)"],
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });
    return;
  }

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Dépenses par catégorie",
        data: Object.values(categories),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });
}

//  Mise à jour du filtre de catégories

function updateCategoryFilter() {
  if (!categoryFilter) return;

  // Récupérer toutes les catégories uniques
  const categories = [...new Set(userExpenses.map((exp) => exp.category))];

  // Sauvegarder la valeur actuelle ou courante
  const currentValue = categoryFilter.value;

  // Vider et remplir le select
  categoryFilter.innerHTML = '<option value="">Toutes catégories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restaurer la valeur sélectionnée si elle existe toujours

  if (categories.includes(currentValue)) {
    categoryFilter.value = currentValue;
  }
}

//  Affichage du tableau

function renderTable() {
  if (!expenseTableBody) return;

  expenseTableBody.innerHTML = "";

  // Filtrer les dépenses
  const filtered = userExpenses.filter((exp) => {
    const matchesSearch = exp.name
      .toLowerCase()
      .includes(searchInput.value.toLowerCase());
    const matchesCategory =
      categoryFilter.value === "" || exp.category === categoryFilter.value;
    const matchesDate =
      dateFilter.value === "" || exp.date.startsWith(dateFilter.value);
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Afficher les dépenses filtrées
  filtered.forEach((exp) => {
    const originalIndex = userExpenses.indexOf(exp);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exp.name}</td>
      <td>${exp.amount}</td>
      <td>${exp.category}</td>
      <td>${exp.date}</td>
      <td>
        <button class="edit-btn" data-index="${originalIndex}">✏️</button>
        <button class="delete-btn" data-index="${originalIndex}">🗑️</button>
      </td>
    `;
    expenseTableBody.appendChild(tr);
  });

  // Calculer le total des dépenses FILTRÉES
  const total = filtered.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  totalDisplay.textContent = total.toFixed(2);

  // Mettre à jour les catégories dans le filtre
  updateCategoryFilter();

  // Actualiser le graphique seulement si on est dans l'onglet dépenses
  const depensesSection = document.getElementById("depenses");
  if (depensesSection && depensesSection.classList.contains("active")) {
    updateChart();
  }
}

//  Ajout d'une dépense
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const name = document.getElementById("expenseName").value.trim();
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value.trim();
    const date = document.getElementById("expenseDate").value;

    if (!name || isNaN(amount) || !category || !date) {
      alert("⚠️ Veuillez remplir tous les champs !");
      return;
    }

    const expense = { name, amount, category, date };

    // Vérifier si on est en mode modification
    if (addBtn.dataset.editIndex !== undefined) {
      // Mode modification
      const index = parseInt(addBtn.dataset.editIndex);
      userExpenses[index] = expense;
      delete addBtn.dataset.editIndex;
      addBtn.textContent = "Ajouter";
    } else {
      // Mode ajout
      userExpenses.push(expense);
    }

    // Sauvegarder pour cet utilisateur
    allData[currentUser.email] = userExpenses;
    localStorage.setItem("expensesData", JSON.stringify(allData));

    // Réinitialiser le formulaire
    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseCategory").value = "";
    document.getElementById("expenseDate").value = "";

    // Mettre à jour la vue
    renderTable();
    switchTab("depenses"); // Redirige vers la section Dépenses
  });
}

//  Suppression et  Modification d'une dépense
if (expenseTableBody) {
  expenseTableBody.addEventListener("click", (e) => {
    // Suppression
    if (e.target.classList.contains("delete-btn")) {
      const index = parseInt(e.target.dataset.index);
      if (confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
        userExpenses.splice(index, 1);
        allData[currentUser.email] = userExpenses;
        localStorage.setItem("expensesData", JSON.stringify(allData));
        renderTable();
      }
    }

    // Modification
    if (e.target.classList.contains("edit-btn")) {
      const index = parseInt(e.target.dataset.index);
      const expense = userExpenses[index];

      // Remplir le formulaire avec les données existantes
      document.getElementById("expenseName").value = expense.name;
      document.getElementById("expenseAmount").value = expense.amount;
      document.getElementById("expenseCategory").value = expense.category;
      document.getElementById("expenseDate").value = expense.date;

      // Changer le bouton "Ajouter" en "Modifier"
      addBtn.textContent = "Modifier";
      addBtn.dataset.editIndex = index;

      // Basculer vers l'onglet "Ajouter"
      switchTab("add");

      // Faire défiler vers le haut
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

//  Supprimer toutes les dépenses
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment tout supprimer ?")) {
      userExpenses = [];
      allData[currentUser.email] = [];
      localStorage.setItem("expensesData", JSON.stringify(allData));
      renderTable();
    }
  });
}

//  Filtres
[searchInput, categoryFilter, dateFilter].forEach((input) => {
  if (input) input.addEventListener("input", renderTable);
});

//  Télécharger en PDF
const downloadPdfBtn = document.getElementById("download-pdf");
if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener("click", () => {
    if (userExpenses.length === 0) {
      alert("⚠️ Aucune dépense à télécharger !");
      return;
    }

    // Utiliser jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("Budget Tracker - Mes Dépenses", 14, 20);

    // Informations utilisateur
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Utilisateur: ${currentUser.email}`, 14, 28);
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 14, 33);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 36, 196, 36);

    // Préparer les données du tableau
    const tableData = userExpenses.map((exp) => [
      exp.name,
      `${exp.amount} FCFA`,
      exp.category,
      exp.date,
    ]);

    // Créer le tableau avec autoTable
    doc.autoTable({
      head: [["Nom", "Montant", "Catégorie", "Date"]],
      body: tableData,
      startY: 40,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: "right" },
        2: { cellWidth: 50 },
        3: { cellWidth: 35 },
      },
    });

    // Calculer le total
    const total = userExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    // Ajouter le total en bas
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.setFont(undefined, "bold");
    doc.text(`TOTAL: ${total.toFixed(2)} FCFA`, 14, finalY);

    // Télécharger le fichier
    const fileName = `budget_tracker_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    doc.save(fileName);

    // Message de confirmation
    alert("✅ PDF téléchargé avec succès !");
  });
}

//  Déconnexion
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
}

//  Navigation entre onglets
const tabLinks = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".section");

function switchTab(tabName) {
  // Désactiver tous les onglets et sections
  tabLinks.forEach((btn) => btn.classList.remove("active"));
  sections.forEach((sec) => sec.classList.remove("active"));

  // Activer l'onglet sélectionné
  tabLinks.forEach((btn) => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add("active");
    }
  });

  // Activer la section correspondante
  sections.forEach((sec) => {
    if (sec.id === tabName) {
      sec.classList.add("active");
    }
  });

  // Mettre à jour le graphique si on bascule vers l'onglet dépenses
  if (tabName === "depenses") {
    setTimeout(() => {
      updateChart();
    }, 100);
  }
}

// Ajouter les écouteurs d'événements sur les boutons d'onglets
tabLinks.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

//  Initialisation
renderTable();
switchTab("add"); // Démarrer sur l'onglet "Ajouter une dépense"
