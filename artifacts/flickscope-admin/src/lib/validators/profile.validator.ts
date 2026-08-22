export function validateName(name: string): string {
  if (!name.trim()) {
    return "Name is required";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }

  return "";
}

export function validateEmail(email: string): string {
  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  if (!email.toLowerCase().endsWith("@gmail.com")) {
    return "Only Gmail accounts are allowed";
  }

  return "";
}

export function validatePhone(phone: string): string {
  if (!phone) {
    return "";
  }

  // Myanmar phone format
  // 09xxxxxxxxx
  const phoneRegex = /^09\d{8,9}$/;

  if (!phoneRegex.test(phone)) {
    return "Invalid Myanmar phone number";
  }

  return "";
}

export function validatePassword(password: string): string {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Need one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Need one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Need one number";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Need one special character";
  }

  return "";
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string {
  if (!confirm) {
    return "Confirm password required";
  }

  if (password !== confirm) {
    return "Passwords do not match";
  }

  return "";
}
