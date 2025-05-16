// Declare global variables for RSA components
let n, phi, d, e;
let currentStep = 1;

// Check if a number is prime
function isPrime(num) {
  if (num <= 1) return false; // Not prime if <= 1
  if (num <= 3) return true;  // 2 and 3 are prime
  if (num % 2 === 0 || num % 3 === 0) return false; // Eliminate divisible by 2 or 3

  // Check potential prime factors up to sqrt(num)
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Validate input value for primality
function checkPrime(id) {
  const num = parseInt(document.getElementById(id).value);
  const checker = document.getElementById(`${id}Checker`);

  // Show or hide error message
  if (!isPrime(num)) {
    checker.style.display = 'block';
    document.getElementById(id).style.borderColor = '#e74c3c';
  } else {
    checker.style.display = 'none';
    document.getElementById(id).style.borderColor = '';
  }
}

// Calculate the greatest common divisor (GCD)
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// Check whether e is coprime with phi(n)
function checkGCD() {
  const p = parseInt(document.getElementById('p').value);
  const q = parseInt(document.getElementById('q').value);
  const e = parseInt(document.getElementById('e').value);

  if (isPrime(p) && isPrime(q)) {
    phi = (p - 1) * (q - 1);
    const checker = document.getElementById('eChecker');

    if (gcd(e, phi) !== 1) {
      checker.style.display = 'block';
      document.getElementById('e').style.borderColor = '#e74c3c';
    } else {
      checker.style.display = 'none';
      document.getElementById('e').style.borderColor = '';
    }
  }
}

// Calculate modular inverse using Extended Euclidean Algorithm
function modInverse(a, m) {
  let m0 = m, t, q;
  let x0 = 0, x1 = 1;
  if (m === 1) return 0;

  // Run the extended Euclidean loop
  while (a > 1) {
    q = Math.floor(a / m);
    t = m;
    m = a % m; a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }

  if (x1 < 0) x1 += m0;
  return x1;
}

// Modular exponentiation using binary method
function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  let result = 1;
  base = base % modulus;

  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % modulus;
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }

  return result;
}

// Generate RSA key pair
function generateKeys() {
  const p = parseInt(document.getElementById('p').value);
  const q = parseInt(document.getElementById('q').value);
  e = parseInt(document.getElementById('e').value);

  if (!isPrime(p) || !isPrime(q)) {
    document.getElementById('keyOutput').innerText = 'Ошибка: p и q должны быть простыми числами!';
    highlightStep(1);
    return;
  }

  n = p * q;
  phi = (p - 1) * (q - 1);
  highlightStep(2);
  highlightStep(3);

  if (gcd(e, phi) !== 1) {
    document.getElementById('keyOutput').innerText = 'Ошибка: e должно быть взаимно простым с φ(n) = ' + phi;
    highlightStep(4);
    return;
  }

  d = modInverse(e, phi);
  highlightStep(5);

  document.getElementById('publicKey').innerHTML = `e = ${e}<br>n = ${n}`;
  document.getElementById('privateKey').innerHTML = `d = ${d}<br>n = ${n}`;

  document.getElementById('keyOutput').innerHTML = `
    <strong>Шаг 1:</strong> p = ${p}, q = ${q} ✓<br>
    <strong>Шаг 2:</strong> n = ${n} ✓<br>
    <strong>Шаг 3:</strong> φ(n) = ${phi} ✓<br>
    <strong>Шаг 4:</strong> e = ${e} ✓<br>
    <strong>Шаг 5:</strong> d = ${d} ✓
  `;

  initAnimation();
}

// Use predefined values for demo
function useDefaultValues() {
  document.getElementById('p').value = '7';
  document.getElementById('q').value = '11';
  document.getElementById('e').value = '17';
  document.getElementById('message').value = '27';

  // Hide error messages
  document.getElementById('pChecker').style.display = 'none';
  document.getElementById('qChecker').style.display = 'none';
  document.getElementById('eChecker').style.display = 'none';

  document.getElementById('p').style.borderColor = '';
  document.getElementById('q').style.borderColor = '';
  document.getElementById('e').style.borderColor = '';

  generateKeys();
}

// Encrypt message M using public key
function encrypt() {
  if (!n || !e) {
    document.getElementById('encryptOutput').innerText = 'Сначала сгенерируйте ключи!';
    return;
  }

  const M = parseInt(document.getElementById('message').value);
  if (M >= n) {
    document.getElementById('encryptOutput').innerText = `Ошибка: Сообщение (${M}) должно быть меньше n (${n})`;
    return;
  }

  const C = modPow(M, e, n);
  document.getElementById('encryptOutput').innerText = `Зашифрованное сообщение: C = ${C}`;
  document.getElementById('cipher').value = C;
  highlightStep(6);

  document.getElementById('encryptSteps').style.display = 'block';
  document.getElementById('encryptSteps').innerHTML = `
    <h3>Шаги шифрования:</h3>
    <div class="math">C = M<sup>e</sup> mod n</div>
    <div class="math">C = ${M}<sup>${e}</sup> mod ${n}</div>
    <div class="math">C = ${C}</div>
  `;

  animateEncryption(M, C);
}

// Decrypt ciphertext C using private key
function decrypt() {
  if (!n || !d) {
    document.getElementById('decryptOutput').innerText = 'Сначала сгенерируйте ключи!';
    return;
  }

  const C = parseInt(document.getElementById('cipher').value);
  const M = modPow(C, d, n);
  document.getElementById('decryptOutput').innerText = `Расшифрованное сообщение: M = ${M}`;
  highlightStep(7);

  document.getElementById('decryptSteps').style.display = 'block';
  document.getElementById('decryptSteps').innerHTML = `
    <h3>Шаги дешифрования:</h3>
    <div class="math">M = C<sup>d</sup> mod n</div>
    <div class="math">M = ${C}<sup>${d}</sup> mod ${n}</div>
    <div class="math">M = ${M}</div>
  `;

  animateDecryption(C, M);
}

// Highlight the current step visually
function highlightStep(step) {
  const steps = document.querySelectorAll('.step');
  steps.forEach(s => s.classList.remove('active-step'));

  const currentStepElement = document.getElementById(`step${step}`);
  if (currentStepElement) {
    currentStepElement.classList.add('active-step');
  }

  currentStep = step;
}

// Tab switcher function
function changeTab(tabId) {
  const tabs = document.getElementsByClassName('tab-content');
  for (let tab of tabs) {
    tab.classList.remove('active');
  }

  const tabButtons = document.getElementsByClassName('tab');
  for (let button of tabButtons) {
    button.classList.remove('active');
  }

  document.getElementById(tabId).classList.add('active');
  document.querySelector(`.tab[onclick="changeTab('${tabId}')"]`).classList.add('active');
}

// On page load, use default RSA values
window.onload = function() {
  useDefaultValues();
};