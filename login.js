document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const message = document.getElementById("loginMessage");

  // Vérification des champs
  if (!email || !password) {
    message.textContent = "Veuillez remplir tous les champs.";
    message.style.color = "red";
    return;
  }

  // Récupérer les utilisateurs enregistrés
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Vérifier si l'utilisateur existe
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    message.textContent = "❌ Identifiants incorrects. Veuillez réessayer.";
    message.style.color = "red";
    return;
  }

  // Sauvegarder l'utilisateur connecté
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Message de succès
  message.textContent = "✅ Connexion réussie ! Redirection...";
  message.style.color = "green";

  // Redirection après une courte pause
  setTimeout(() => {
    window.location.href = "main.html";
  }, 1200);
});
