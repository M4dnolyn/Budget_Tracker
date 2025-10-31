document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // --- Récupération des valeurs du formulaire ---
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();
    const message = document.getElementById("registerMessage");

    // --- Vérification des champs vides ---
    if (!email || !password || !confirm) {
      return showMessage("⚠️ Veuillez remplir tous les champs.", "red");
    }

    // --- Vérification de l'adresse e-mail ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showMessage("Adresse e-mail invalide.", "red");
    }

    // --- Vérification de la longueur du mot de passe ---
    if (password.length < 6) {
      return showMessage(
        "Le mot de passe doit contenir au moins 6 caractères.",
        "red"
      );
    }

    // --- Vérification de la correspondance des mots de passe ---
    if (password !== confirm) {
      return showMessage("Les mots de passe ne correspondent pas.", "red");
    }

    // --- Récupération des utilisateurs enregistrés ---
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // --- Vérification si l'utilisateur existe déjà ---
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return showMessage("Cet email est déjà enregistré.", "red");
    }

    // --- Enregistrement du nouvel utilisateur ---
    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("✅ Compte créé avec succès ! Redirection...", "green");

    // --- Redirection vers la page de connexion ---
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1800);

    // --- Fonction utilitaire d’affichage du message ---
    function showMessage(text, color) {
      message.textContent = text;
      message.style.color = color;
    }
  });
