const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email) {
  if (!email) {
    return "El correo electrónico es necesario.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Introduce un correo electrónico válido.";
  }

  return null;
}

function getPasswordCategories(password) {
  let count = 0;
  if (/[a-z]/.test(password)) count++;
  if (/[A-Z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[^a-zA-Z0-9]/.test(password)) count++;
  return count;
}

export function validatePassword(password) {
  if (!password) {
    return "La contraseña es necesaria.";
  }

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  if (getPasswordCategories(password) < 3) {
    return "La contraseña debe contener al menos 3 de las siguientes categorías: minúsculas, mayúsculas, números, símbolos.";
  }

  return null;
}
