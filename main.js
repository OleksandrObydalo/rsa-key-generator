let n, phi, d, e;
let currentStep = 1;

// Проверка, является ли число простым
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Проверка ввода на простоту
function checkPrime(id) {
  const num = parseInt(document.getElementById(id).value);
  const checker = document.getElementById(`${id}Checker`);
  
  if (!isPrime(num)) {
    checker.style.display = 'block';
    document.getElementById(id).style.borderColor = '#e74c3c';
  } else {
    checker.style.display = 'none';
    document.getElementById(id).style.borderColor = '';
  }
}

// Наибольший общий делитель
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// Проверка e на взаимную простоту с φ(n)
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

// Мультипликативная инверсия по модулю
function modInverse(a, m) {
  let m0 = m, t, q;
  let x0 = 0, x1 = 1;
  if (m === 1) return 0;
  
  // Расширенный алгоритм Евклида
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

// Возведение в степень по модулю
function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  let result = 1;
  base = base % modulus;
  
  // Бинарное возведение в степень
  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % modulus;
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }
  
  return result;
}

// Генерация ключей RSA
function generateKeys() {
  const p = parseInt(document.getElementById('p').value);
  const q = parseInt(document.getElementById('q').value);
  e = parseInt(document.getElementById('e').value);
  
  // Проверка на простоту
  if (!isPrime(p) || !isPrime(q)) {
    document.getElementById('keyOutput').innerText = 'Ошибка: p и q должны быть простыми числами!';
    highlightStep(1);
    return;
  }
  
  // Вычисление n и phi
  n = p * q;
  phi = (p - 1) * (q - 1);
  highlightStep(2);
  highlightStep(3);
  
  // Проверка на взаимную простоту e и phi
  if (gcd(e, phi) !== 1) {
    document.getElementById('keyOutput').innerText = 'Ошибка: e должно быть взаимно простым с φ(n) = ' + phi;
    highlightStep(4);
    return;
  }
  
  // Вычисление секретного ключа d
  d = modInverse(e, phi);
  highlightStep(5);
  
  // Отображение ключей
  document.getElementById('publicKey').innerHTML = `e = ${e}<br>n = ${n}`;
  document.getElementById('privateKey').innerHTML = `d = ${d}<br>n = ${n}`;
  
  document.getElementById('keyOutput').innerHTML = `
    <strong>Шаг 1:</strong> p = ${p}, q = ${q} (простые числа) ✓<br>
    <strong>Шаг 2:</strong> n = p × q = ${p} × ${q} = ${n} ✓<br>
    <strong>Шаг 3:</strong> φ(n) = (p-1)(q-1) = ${p-1} × ${q-1} = ${phi} ✓<br>
    <strong>Шаг 4:</strong> e = ${e} (взаимно просто с ${phi}) ✓<br>
    <strong>Шаг 5:</strong> d = ${d} (такое что ${d} × ${e} ≡ 1 mod ${phi}) ✓
  `;
  
  // Активируем анимацию
  initAnimation();
}

// Использовать стандартные значения
function useDefaultValues() {
  document.getElementById('p').value = '7';
  document.getElementById('q').value = '11';
  document.getElementById('e').value = '17';
  document.getElementById('message').value = '27';
  
  // Скрываем сообщения об ошибках
  document.getElementById('pChecker').style.display = 'none';
  document.getElementById('qChecker').style.display = 'none';
  document.getElementById('eChecker').style.display = 'none';
  
  document.getElementById('p').style.borderColor = '';
  document.getElementById('q').style.borderColor = '';
  document.getElementById('e').style.borderColor = '';
  
  generateKeys();
}

// Зашифрование сообщения
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
  
  // Показываем шаги шифрования
  document.getElementById('encryptSteps').style.display = 'block';
  document.getElementById('encryptSteps').innerHTML = `
    <h3>Шаги шифрования:</h3>
    <div class="math">C = M<sup>e</sup> mod n</div>
    <div class="math">C = ${M}<sup>${e}</sup> mod ${n}</div>
    <div class="math">C = ${C}</div>
  `;
  
  // Анимация шифрования
  animateEncryption(M, C);
}

// Расшифрование сообщения
function decrypt() {
  if (!n || !d) {
    document.getElementById('decryptOutput').innerText = 'Сначала сгенерируйте ключи!';
    return;
  }
  
  const C = parseInt(document.getElementById('cipher').value);
  const M = modPow(C, d, n);
  document.getElementById('decryptOutput').innerText = `Расшифрованное сообщение: M = ${M}`;
  highlightStep(7);
  
  // Показываем шаги дешифрования
  document.getElementById('decryptSteps').style.display = 'block';
  document.getElementById('decryptSteps').innerHTML = `
    <h3>Шаги дешифрования:</h3>
    <div class="math">M = C<sup>d</sup> mod n</div>
    <div class="math">M = ${C}<sup>${d}</sup> mod ${n}</div>
    <div class="math">M = ${M}</div>
  `;
  
  // Анимация дешифрования
  animateDecryption(C, M);
}

// Переключение вкладок
function changeTab(tabId) {
  // Скрыть все вкладки и деактивировать кнопки
  const tabs = document.getElementsByClassName('tab-content');
  for (let tab of tabs) {
    tab.classList.remove('active');
  }
  
  const tabButtons = document.getElementsByClassName('tab');
  for (let button of tabButtons) {
    button.classList.remove('active');
  }
  
  // Показать выбранную вкладку и активировать кнопку
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`.tab[onclick="changeTab('${tabId}')"]`).classList.add('active');
}

// Подсветка текущего шага
function highlightStep(step) {
  const steps = document.querySelectorAll('.step');
  steps.forEach(s => s.classList.remove('active-step'));
  
  const currentStepElement = document.getElementById(`step${step}`);
  if (currentStepElement) {
    currentStepElement.classList.add('active-step');
  }
  
  currentStep = step;
}

// Инициализация анимации
function initAnimation() {
  const container = document.getElementById('animationContainer');
  container.innerHTML = `
    <div class="key" style="top: 80px; left: 50px;">
      <img src="key.png" width="50" alt="Ключ">
      <div>Закрытый ключ (d=${d})</div>
    </div>
    <div class="lock" style="top: 80px; left: 200px;">
      <img src="lock.png" width="50" alt="Замок">
      <div>Открытый ключ (e=${e})</div>
    </div>
    <div class="message" style="top: 80px; left: 350px;">
      <img src="message.png" width="50" alt="Сообщение">
      <div>Сообщение</div>
    </div>
  `;
}

// Анимация шифрования
function animateEncryption(M, C) {
  const container = document.getElementById('animationContainer');
  const message = container.querySelector('.message');
  
  if (message) {
    message.innerHTML = `
      <img src="message.png" width="50" alt="Сообщение">
      <div>M = ${M}</div>
    `;
    
    // Анимация перемещения сообщения к замку
    setTimeout(() => {
      message.style.left = '200px';
      message.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        // Создаем зашифрованное сообщение
        const cipher = document.createElement('div');
        cipher.className = 'cipher';
        cipher.style.top = '80px';
        cipher.style.left = '200px';
        cipher.style.opacity = '0';
        cipher.innerHTML = `
          <img src="cipher.png" width="50" alt="Шифр">
          <div>C = ${C}</div>
        `;
        container.appendChild(cipher);
        
        // Показываем зашифрованное сообщение
        setTimeout(() => {
          message.style.opacity = '0';
          cipher.style.opacity = '1';
          
          // Перемещаем зашифрованное сообщение
          setTimeout(() => {
            cipher.style.left = '350px';
          }, 500);
        }, 500);
      }, 1000);
    }, 500);
  }
}

// Анимация дешифрования
function animateDecryption(C, M) {
  const container = document.getElementById('animationContainer');
  const cipher = container.querySelector('.cipher');
  
  if (cipher) {
    // Перемещаем зашифрованное сообщение к ключу
    cipher.style.left = '50px';
    
    setTimeout(() => {
      cipher.style.opacity = '0';
      
      // Создаем расшифрованное сообщение
      const message = document.createElement('div');
      message.className = 'message';
      message.style.top = '80px';
      message.style.left = '50px';
      message.style.opacity = '0';
      message.innerHTML = `
        <img src="message.png" width="50" alt="Сообщение">
        <div>M = ${M}</div>
      `;
      container.appendChild(message);
      
      // Показываем расшифрованное сообщение
      setTimeout(() => {
        message.style.opacity = '1';
        
        // Перемещаем расшифрованное сообщение
        setTimeout(() => {
          message.style.left = '350px';
        }, 500);
      }, 500);
    }, 1000);
  }
}

// Полная анимация процесса RSA
function playAnimation() {
  if (!n || !e || !d) {
    alert('Сначала сгенерируйте ключи!');
    return;
  }
  
  const container = document.getElementById('animationContainer');
  container.innerHTML = '';
  
  // Создаем элементы анимации
  const alice = document.createElement('div');
  alice.className = 'person';
  alice.style.left = '50px';
  alice.style.top = '50px';
  alice.innerHTML = '<div>Алиса 👩</div>';
  
  const bob = document.createElement('div');
  bob.className = 'person';
  bob.style.right = '50px';
  bob.style.top = '50px';
  bob.innerHTML = '<div>Боб 👨</div>';
  
  const message = document.createElement('div');
  message.className = 'message';
  message.style.left = '100px';
  message.style.top = '100px';
  message.innerHTML = `<div>Сообщение: M = ${document.getElementById('message').value}</div>`;
  
  container.appendChild(alice);
  container.appendChild(bob);
  container.appendChild(message);
  
  // Пошаговая анимация
  let step = 1;
  const runAnimation = () => {
    if (step === 1) {
      // Боб генерирует ключи
      const publicKey = document.createElement('div');
      publicKey.className = 'key';
      publicKey.style.right = '100px';
      publicKey.style.top = '100px';
      publicKey.innerHTML = `<div>Открытый ключ (e=${e}, n=${n})</div>`;
      container.appendChild(publicKey);
      
      const privateKey = document.createElement('div');
      privateKey.className = 'key';
      privateKey.style.right = '100px';
      privateKey.style.top = '130px';
      privateKey.innerHTML = `<div>Закрытый ключ (d=${d}, n=${n})</div>`;
      container.appendChild(privateKey);
      
      setTimeout(() => {
        // Отправка открытого ключа Алисе
        publicKey.style.left = '100px';
        publicKey.style.top = '150px';
        step++;
        setTimeout(runAnimation, 1500);
      }, 1000);
      
    } else if (step === 2) {
      // Алиса шифрует сообщение
      const M = parseInt(document.getElementById('message').value);
      const C = modPow(M, e, n);
      
      const cipher = document.createElement('div');
      cipher.className = 'cipher';
      cipher.style.left = '100px';
      cipher.style.top = '180px';
      cipher.innerHTML = `<div>Шифр: C = ${C}</div>`;
      container.appendChild(cipher);
      
      setTimeout(() => {
        // Отправка шифра Бобу
        cipher.style.right = '100px';
        cipher.style.left = 'auto';
        step++;
        setTimeout(runAnimation, 1500);
      }, 1000);
      
    } else if (step === 3) {
      // Боб расшифровывает сообщение
      const C = parseInt(document.getElementById('cipher').value);
      const M = modPow(C, d, n);
      
      const decrypted = document.createElement('div');
      decrypted.className = 'message';
      decrypted.style.right = '100px';
      decrypted.style.top = '210px';
      decrypted.innerHTML = `<div>Расшифровано: M = ${M}</div>`;
      container.appendChild(decrypted);
      
      // Завершение анимации
    }
  };
  
  runAnimation();
}

// Инициализация
window.onload = function() {
  useDefaultValues();
};

